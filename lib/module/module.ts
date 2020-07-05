import Communicator from "../communicator/communicator";
import ICallbackReceive from "../types/functions/iCallbackReceive";
import IValue from "../types/structure/iValue";
import CommandBuilder from "../commandBuilder/commandBuilder";

abstract class Module {
    abstract driverRequiere: string;
    abstract key : string;

    commandBuilder : CommandBuilder;

    communicator : Communicator | null = null;

    receiver : ICallbackReceive[] = [];

    constructor(commandBuilder: CommandBuilder) {
        this.commandBuilder = commandBuilder;
    }

    abstract setValue(channel: number, value: IValue) : void;
    abstract requestValue(channel: number) : void;

    setCommunicator(communicator: Communicator) {
        this.communicator = communicator;
    }
    
    callbackReceive(data: Uint8Array) : void {
        if(this.commandBuilder.isPackageForMe(data)) {
            this.receiver.forEach((callback) => {
                callback(data);
            });
        }
    }

    addCallbackReiceve(callback: ICallbackReceive) : void {
        this.receiver.push(callback);
    }

}

export default Module;