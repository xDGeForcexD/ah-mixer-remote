import Driver from "../driver/driver";
import {Socket} from "net";
import ICallbackReceive from "../types/functions/iCallbackReceive";
import ICallbackConnection from "../types/functions/iCallbackConnection";

class Communicator {
    receiver : ICallbackReceive[] = [];
    driver : Driver;

    enable : Boolean = false;
    connectedServer : Boolean = false;
    errorFlag : Boolean = false;
    errorMessage : string | null = null;

    client : Socket;
    
    timeoutConnect : NodeJS.Timeout  | null = null;

    queue : Uint8Array[] = [];
    intervalQueue : NodeJS.Timeout | null = null;

    callbackConnection : ICallbackConnection | null = null;

    constructor(driver: Driver) {
        this.driver = driver;

        this.client = new Socket();
        this.client.on('connect', this.connected.bind(this));
        this.client.on('data', this.read.bind(this));
        this.client.on('error', this.error.bind(this));
        this.client.on('close', this.close.bind(this));
    }

    /**
     * Enable Connection to the mixer
     */
    connect() : void {
        if(!this.enable) {
            this.enable = true;
            this.startConnection();    
        }
    }

    /**
     * Disable Connection to the mixer
     */
    disconnect() : void {
        if(this.enable) {
            this.enable = false;
            this.client.end();    
        }
    }

    /**
     * Returns true if mixer is connected
     * @returns boolean if mixer is connected
     */
    isConnected() : Boolean {
        return this.connectedServer;
    }


    /**
     * Returns error message
     * @returns string of message or null if no error
     */
    getError() : string  | null {
        this.errorFlag = false;
        return this.errorMessage;
    }

    /**
     * Save Connection Status
     * @param status status of the connection 
     */
    private connectionChange(status: boolean) {
        this.connectedServer = status;
        if(this.callbackConnection !== null) {
            this.callbackConnection(status);
        }
    }

    /**
     * Repeat Connection after wait time
     * @param timeout time in milli seconds to wait
     */
    private launchTimeoutConnect(timeout : number = 5000) {
        if(this.enable && this.timeoutConnect === null) {
            this.timeoutConnect = setTimeout(this.startConnection.bind(this), timeout);
        }
    }

    /**
     * Start connection to the mixer
     */
    private startConnection() {
        this.timeoutConnect = null;
        this.client.connect({
            port: this.driver.port,
            host: this.driver.ip
        });
    }

    /**
     * Handler if connections is establish
     */
    private connected(error : any) {
        if(!this.errorFlag) {
            this.errorMessage = null;
        }
        this.connectionChange(true);
    }

    /**
     * Handler if data is comming in
     * @param data Uint8 Array with received data
     */
    private read(data : Uint8Array) {
        this.receiver.forEach((callback) => callback(data)); 
    }

    /**
     * Handler if connection is broken
     * @param error error message
     */
    private error(error : any) {
        this.errorFlag = true;
        if(error instanceof Error) {
            this.errorMessage = error.message;
        } else {
            this.errorMessage = error;
        }
        this.connectionChange(false);
        this.launchTimeoutConnect(1000);
    }

    /**
     * Handler if connection is closed
     * @param error error message
     */
    private close(error : any) {
        this.connectionChange(false);
        this.launchTimeoutConnect();
    }

    /**
     * Send message to mixer
     * @param data UInt8 with data to send
     * @param duplicateCheck array of booleans if data byte is not equal with old data byte and duplicateCheck index is false then update data with new one
     */
    write(data: Uint8Array, duplicateCheck?: boolean[]) : void {
        if(duplicateCheck === undefined) {
            this.queue.push(data);
        } else {
            let addToQueue = true;
            for(let i=0; i<this.queue.length; i++) {
                let isDuplicate = true;
                for(let k=0; k<this.queue[i].length && k<data.length && k<duplicateCheck.length; k++) {
                    if(duplicateCheck[k] && this.queue[i][k] !== data[k]) {
                        isDuplicate = false;
                        break;
                    }
                }
                if(isDuplicate) {
                    addToQueue = false;
                    this.queue[i] = data;
                    break;
                }
            }
            if(addToQueue) {
                this.queue.push(data);
            }
        }
        
        if(this.intervalQueue === null) {
            let sendDataNow = this.queue.shift();
            if(sendDataNow !== undefined) {
                this.client.write(sendDataNow);
                this.intervalQueue = setInterval(() => {
                    let sendData = this.queue.shift();
                    if(sendData === undefined) {
                        clearInterval(this.intervalQueue!);
                        this.intervalQueue = null;
                        return;
                    }
                    this.client.write(sendData);
                }, 100);
            }
            
        }
    }

    /**
     * Add Receiver Callbacks to receive message
     * @param callback callback function
     */
    addReceiver(callback: ICallbackReceive) : void {
        this.receiver.push(callback);
    }

    /**
     * Execute callback if connection is changed
     * @param callback callback function execute if connection changed 
     */
    setCallbackConnection(callback: ICallbackConnection) {
        this.callbackConnection = callback;
    }

}

export default Communicator;