import ModuleMute from "../../../module/types/mute";
import CommandBuilderSQ from "../commandBuilder";
import ValueState from "../../../types/structure/valueState";
import IAddressRange from "../../../types/structure/iAddressRange";
import Validator from "../../../validator/validator";

class ModuleSQMute extends ModuleMute {
    driverRequiere: string = "sq";

    addressRange : IAddressRange;

    commandBuilder : CommandBuilderSQ;
    validator: Validator;
    constructor(commandBuilder: CommandBuilderSQ, validator: Validator) {
        super(commandBuilder);
        this.commandBuilder = commandBuilder;
        this.validator = validator;
        this.addressRange = {msb: {from: 0x00, to: 0x00}, lsb: {from: 0x00, to: 0x2f}};
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
        this.validator.checkInput(channel);

        let address = this.calcAddress(channel);
        this.communicator.write(this.commandBuilder.toSendValue(address.msb, address.lsb, 0, value.value ? 1 : 0), [true, true, true, true, true, true, true, true, true, true, true, false]);
    };

    /**
     * Takes input number to toggle mute the input on mixer
     * @param channel Input number 1 - 48 (e.g. Ip1)
     */
    toggleValue(channel: number) : void {
        if(this.communicator === null) {
            throw new Error("no communicator is set");
        }
        this.validator.checkInput(channel);

        let address = this.calcAddress(channel);
        this.communicator.write(this.commandBuilder.toSendInc(address.msb, address.lsb), [true, true, true, true, true, true, true, true, true]);
    }

    /**
     * Takes a input number to request the mute state on the input from mixer
     * @param channel Input number 1 - 48 (e.g. Ip1)
     */
    requestValue(channel: number): void {
        if(this.communicator === null) {
            throw new Error("no communicator is set");
        }
        this.validator.checkInput(channel);

        let address = this.calcAddress(channel);
        this.communicator.write(this.commandBuilder.toGetValue(address.msb, address.lsb), [true, true, true, true, true, true, true, true, true]);
    }
    
    /**
     * Callback if data receive and execute callbacks
     * @param data Data Array
     */
    callbackReceive(data: Uint8Array) : void {
        if(this.commandBuilder.isPackageForMe(this.addressRange, data)) {
            let receiver = this.commandBuilder.parseReceiver(data);
            let value = this.commandBuilder.parseValue(data);
            let receiverParsed = this.calcChannel(receiver.msb, receiver.lsb);
            let valueParsed = new ValueState(value.vf > 0 ? true : false);
            this.receiver.forEach((callback) => {
                callback(receiverParsed, valueParsed);
            });
            
        }
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

    /** Calculates the channel of given Adddress
     * 
     * @param msb MSB Value
     * @param lsb LSB Value
     * @returns mix and channel number 
     */
    private calcChannel(msb: number, lsb: number) : number {
        return lsb+1;
    }
}

export default ModuleSQMute;