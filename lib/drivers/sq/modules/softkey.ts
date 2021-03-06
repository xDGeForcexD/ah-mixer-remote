import ModuleSoftkey from "../../../module/types/softkey";
import ValueState from "../../../types/structure/valueState";
import Validator from "../../../validator/validator";
import CommandBuilderSQ from "../commandBuilder";


class ModuleSQSoftkey extends ModuleSoftkey {
    driverRequiere: string = "sq";

    validator: Validator;
    constructor(commandBuilder: CommandBuilderSQ, validator: Validator) {
        super(commandBuilder);
        this.validator = validator;
    }
    
    /**
     * Takes softkey number and value to execute the softkey on the mixer
     * @param channel Softkey number 1 - 16
     * @param value ValueState Class with true / false
     */
    setValue(channel: number, value: ValueState): void {
        if(this.communicator === null) {
            throw new Error("no communicator is set");
        }

        this.validator.checkSoftkey(channel);

        let data = new Uint8Array(3);
        if(value.value) {
            data[0] = 0x90;
            data[2] = 0x7f;
        } else {
            data[0] = 0x80;
            data[2] = 0x00;
        }
        data[0] = data[0] + this.commandBuilder.midiChannel;
        data[1] = 0x30 + channel - 1;

        this.communicator.write(data, [false, true, false]);
    }
    
    /**
     * Option not available!
     * @param channel Scene number 1 - 300
     * @ignore requestValue option is not available!
     */
    requestValue(channel: number): void {
        throw new Error("option not available");
    }

    /**
     * Callback if data receive and execute callbacks
     * @param data Data Array
     * @ignore callback for softkeys not available
     */
    callbackReceive(data: Uint8Array) : void {
    }

}

export default ModuleSQSoftkey;