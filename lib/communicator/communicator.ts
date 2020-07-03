import Driver from "../driver/driver";
import {Socket} from "net";
import ICallbackReceive from "../types/functions/iCallbackReceive";
import { send } from "process";

class Communicator {
    receiver : ICallbackReceive[] = [];
    driver : Driver;

    enable : Boolean = false;
    connectedServer : Boolean = false;

    client : Socket;
    
    timeoutConnect : NodeJS.Timeout  | null = null;

    queue : string[] = [];
    intervalQueue : NodeJS.Timeout | null = null;

    constructor(driver: Driver) {
        this.driver = driver;

        this.client = new Socket();
        this.client.on('connect', this.connected.bind(this));
        this.client.on('data', this.read.bind(this));
        this.client.on('error', this.error.bind(this));
        this.client.on('close', this.close.bind(this));
    }

    connect() : void {
        this.enable = true;
        this.startConnection();
    }

    disconnect() : void {
        this.enable = false;
        this.client.end();
    }

    isConnected() : Boolean {
        return this.connectedServer;
    }

    private launchTimeoutConnect(timeout : number = 5000) {
        if(this.enable && this.timeoutConnect === null) {
            this.timeoutConnect = setTimeout(this.startConnection.bind(this), timeout);
        }
    }

    private clearTimeoutConnect() {
        if(this.timeoutConnect !== null) {
            clearTimeout(this.timeoutConnect);
            this.timeoutConnect = null;
        }
    }

    private startConnection() {
        this.client.connect({
            port: this.driver.port,
            host: this.driver.ip
        });
    }

    private connected(error : any) {
        this.connectedServer = true;
        this.clearTimeoutConnect();
    }

    private read(data : string) {
        this.receiver.forEach((callback) => callback(data)); 
    }

    private error(error : any) {
        this.connectedServer = false;
        this.launchTimeoutConnect(1000);
    }

    private close(error : any) {
        this.connectedServer = false;
        this.launchTimeoutConnect();
    }

    write(data: string) : void {
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

    addReceiver(callback: ICallbackReceive) : void {
        this.receiver.push(callback);
    }

}

export default Communicator;