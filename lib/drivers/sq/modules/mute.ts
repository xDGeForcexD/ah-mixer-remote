import ModuleMute from "../../../module/types/mute";
import CommandBuilderSQ from "../commandBuilder";
import ValueState from "../../../types/structure/valueState";

class ModuleSQMute extends ModuleMute {
    driverRequiere: string = "sq";

    commandBuilder : CommandBuilderSQ;
    constructor(commandBuilder: CommandBuilderSQ) {
        super(commandBuilder);
        this.commandBuilder = commandBuilder;
    }

    /**
     * Takes input number and value to mute input on mixer
     * @param channel Input number 1 - 48 (e.g. Ip1)
     * @param value ValueState Class with true / false
     */
    setValue(channel: number, value: ValueState) : void {
        if(this.communicator === null) {
            throw new Error("no communicator is set");
        }

        if(!this.checkValidChannel(channel)) {
            throw new Error("wrong channel input");
        }

        let address = this.calcAddress(channel);
        this.communicator.write(this.commandBuilder.toSendValue(address.msb, address.lsb, 0, value.value ? 1 : 0));
    };

    /**
     * Takes input number to toggle mute the input on mixer
     * @param channel Input number 1 - 48 (e.g. Ip1)
     */
    toggleValue(channel: number) : void {
        if(this.communicator === null) {
            throw new Error("no communicator is set");
        }

        if(!this.checkValidChannel(channel)) {
            throw new Error("wrong channel input");
        }

        let address = this.calcAddress(channel);
        this.communicator.write(this.commandBuilder.toSendInc(address.msb, address.lsb));
    }

    /**
     * Takes a input number to request the mute state on the input from mixer
     * @param channel Input number 1 - 48 (e.g. Ip1)
     */
    requestValue(channel: number): void {
        if(this.communicator === null) {
            throw new Error("no communicator is set");
        }

        if(!this.checkValidChannel(channel)) {
            throw new Error("wrong channel input");
        }

        let address = this.calcAddress(channel);
        this.communicator.write(this.commandBuilder.toGetValue(address.msb, address.lsb));
    }

    /**
     * Calculates the Address from given mix and channel
     * @param mix Mixes Enum LR, Aux1 - Aux12
     * @param channel Input number 1 - 48 (e.g. Ip1)
     * @returns object from msb and lsb
     */
    private calcAddress(channel: number) : {msb: number, lsb: number} {
        return {msb: 0x00, lsb: channel-1};
    }

    /**
     * Check if Channel ist valid (Range 1 - 48)
     * @param channel Input number 1 - 48 (e.g. Ip1)
     * @returns true for its valid
     */
    private checkValidChannel(channel: number) : Boolean {
        if(channel > 0 && channel < 49) {
            return true;
        }
        return false;
    }

}

export default ModuleSQMute;