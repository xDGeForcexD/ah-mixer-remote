import Driver from "../driver/driver";
import {Socket} from "net";
import ICallbackReceive from "../types/functions/iCallbackReceive";

class Communicator {
    receiver : ICallbackReceive[] = [];
    driver : Driver;

    enable : Boolean = false;
    connectedServer : Boolean = false;

    client : Socket;
    
    timeoutConnect : NodeJS.Timeout  | null = null;

    queue : Uint8Array[] = [];
    intervalQueue : NodeJS.Timeout | null = null;

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
        this.enable = true;
        this.startConnection();
    }

    /**
     * Disable Connection to the mixer
     */
    disconnect() : void {
        this.enable = false;
        this.client.end();
    }

    /**
     * Returns true if mixer is connected
     * @returns boolean if mixer is connected
     */
    isConnected() : Boolean {
        return this.connectedServer;
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
     * Clear Timeout Connect
     */
    private clearTimeoutConnect() {
        if(this.timeoutConnect !== null) {
            clearTimeout(this.timeoutConnect);
            this.timeoutConnect = null;
        }
    }

    /**
     * Start connection to the mixer
     */
    private startConnection() {
        this.client.connect({
            port: this.driver.port,
            host: this.driver.ip
        });
    }

    /**
     * Handler if connections is establish
     */
    private connected(error : any) {
        this.connectedServer = true;
        this.clearTimeoutConnect();
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
        this.connectedServer = false;
        this.launchTimeoutConnect(1000);
    }

    /**
     * Handler if connection is closed
     * @param error error message
     */
    private close(error : any) {
        this.connectedServer = false;
        this.launchTimeoutConnect();
    }

    /**
     * Send message to mixer
     * @param data UInt8 with data to send
     */
    write(data: Uint8Array) : void {
        this.queue.push(data);
        
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

}

export default Communicator;