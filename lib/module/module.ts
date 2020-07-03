import Communicator from "../communicator/communicator";
import ICallbackReceive from "../types/functions/iCallbackReceive";

abstract class Module {
    abstract driverRequiere: string;
    abstract key : string;

    constructor() {
    }

    abstract setValue(channel: number, value: number) : void;
    abstract requestValue(channel: number) : void;
    
    callbackReceive(data: string) : void {
        
    }

    addCallbackReiceve(callback: ICallbackReceive) {

    }

}

export default Module;