import Communicator from "../communicator/communicator";
import IValue from "../types/structure/iValue";
import CommandBuilder from "../commandBuilder/commandBuilder";
import ICallbackValue from "../types/functions/iCallbackValue";

abstract class Module {
    abstract driverRequiere: string;
    abstract key : string;

    commandBuilder : CommandBuilder;

    communicator : Communicator | null = null;

    receiver : ICallbackValue[] = [];

    constructor(commandBuilder: CommandBuilder) {
        this.commandBuilder = commandBuilder;
    }

    abstract setValue(channel: number, value: IValue) : void;
    abstract requestValue(channel: number) : void;

    setCommunicator(communicator: Communicator) {
        this.communicator = communicator;
    }
    
    abstract callbackReceive(data: Uint8Array) : void

    /**
     * Add Callback if data is received
     * if there is more then one mix, this will execute on the main!
     * @param callback Callback Function
     */
    addCallbackReiceve(callback: ICallbackValue) : void {
        this.receiver.push(callback);
    }

}

export default Module;