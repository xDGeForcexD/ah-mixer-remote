import ModuleSoftkey from "../../../module/types/softkey";
import ValueState from "../../../types/structure/valueState";


class ModuleSQSoftkey extends ModuleSoftkey {
    driverRequiere: string = "sq";

    /**
     * Takes softkey number and value to execute the softkey on the mixer
     * @param channel Softkey number 1 - 16
     * @param value ValueState Class with true / false
     */
    setValue(channel: number, value: ValueState): void {
        if(this.communicator === null) {
            throw new Error("no communicator is set");
        }

        if(channel < 1 || channel > 16) {
            throw new Error("wrong softkey input");
        }

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

        this.communicator.write(data);
    }
    
    /**
     * Option not available!
     * @param channel Scene number 1 - 300
     * @ignore requestValue option is not available!
     */
    requestValue(channel: number): void {
        throw new Error("option not available");
    }

}

export default ModuleSQSoftkey;