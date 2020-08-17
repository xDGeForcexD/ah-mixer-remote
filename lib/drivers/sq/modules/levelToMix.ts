import ModuleLevelToMix from "../../../module/types/levelToMix";
import ValueLevel from "../../../types/structure/valueLevel";
import CommandBuilderSQ from "../commandBuilder";
import ICallbackMixValue from "../../../types/functions/iCallbackMixValue";
import IAddressRange from "../../../types/structure/iAddressRange";
import Validator from "../../../validator/validator";
import IMix from "../../../types/structure/iMix";

class ModuleSQLevelToMix extends ModuleLevelToMix {
    driverRequiere: string = "sq";

    receiverMix : ICallbackMixValue[] = [];
    addressRange : IAddressRange;

    commandBuilder: CommandBuilderSQ;
    validator: Validator;
    constructor(commandBuilder: CommandBuilderSQ, validator: Validator) {
        super(commandBuilder);
        this.commandBuilder = commandBuilder;
        this.validator = validator;
        this.addressRange = {msb: {from: 0x40, to: 0x45}, lsb: {from: 0x00, to: 0x7f}};
    }

    /**
     * Takes input number and value to send value on LR Mix to mixer
     * @param channel Input number 1 - 48 (e.g. Ip1)
     * @param value ValueLevel Class with Level from -inf db to +10db
     */
    setValue(channel: number, value: ValueLevel) : void {
        this.setValueMix("lr", channel, value);
    }

    /**
     * Takes mix, input number and value to send value to mixer
     * @param mix Mixes Enum LR, Aux1 - Aux12
     * @param channel Input number 1 - 48 (e.g. Ip1)
     * @param value ValueLevel Class with Level from -inf db to +10db
     */
    setValueMix(mix: "lr" | IMix, channel: number, value: ValueLevel) : void {
        if(this.communicator === null) {
            throw new Error("no communicator is set");
        }
        this.validator.checkMixAndInput(mix, channel);

        let address = this.calcAddress(mix, channel);
        let valueSend = this.encode(value);
        this.communicator.write(this.commandBuilder.toSendValue(address.msb, address.lsb, valueSend.vc, valueSend.vf), [true, true, true, true, true, true, true, true, false, true, true, false]);
    };

    /**
     * Takes a input number to send level increment of 1db on LR Mix to mixer
     * @param channel Input number 1 - 48 (e.g. Ip1)
     */
    incValue(channel: number) {
        this.incValueMix("lr", channel);
    }

    /**
     * Takes mix and input number to send level increment of 1db to mixer
     * @param mix Mixes Enum LR, Aux1 - Aux12
     * @param channel Input number 1 - 48 (e.g. Ip1)
     */
    incValueMix(mix: "lr" | IMix, channel: number) {
        if(this.communicator === null) {
            throw new Error("no communicator is set");
        }
        this.validator.checkMixAndInput(mix, channel);

        let address = this.calcAddress(mix, channel);
        this.communicator.write(this.commandBuilder.toSendInc(address.msb, address.lsb));
    }

    /**
     * Takes a input number to send level decrement of 1db on LR Mix to mixer
     * @param channel Input number 1 - 48 (e.g. Ip1)
     */
    decValue(channel: number) {
        this.decValueMix("lr", channel);
    }

    /**
     * Takes mix and input number to send level decrement of 1db to mixer
     * @param mix Mixes Enum LR, Aux1 - Aux12
     * @param channel Input number 1 - 48 (e.g. Ip1)
     */
    decValueMix(mix: "lr" | IMix, channel: number) {
        if(this.communicator === null) {
            throw new Error("no communicator is set");
        }
        this.validator.checkMixAndInput(mix, channel);

        let address = this.calcAddress(mix, channel);
        this.communicator.write(this.commandBuilder.toSendDec(address.msb, address.lsb));
    }

    /**
     * Takes a input number to request the level on LR Mix from mixer
     * @param channel Input number 1 - 48 (e.g. Ip1)
     */
    requestValue(channel: number): void {
        this.requestValueMix("lr", channel);
    }

    /**
     * Takes mix and input number to request the level from mixer
     * @param mix Mixes Enum LR, Aux1 - Aux12
     * @param channel Input number 1 - 48 (e.g. Ip1)
     */
    requestValueMix(mix: "lr" | IMix, channel: number) {
        if(this.communicator === null) {
            throw new Error("no communicator is set");
        }
        this.validator.checkMixAndInput(mix, channel);

        let address = this.calcAddress(mix, channel);
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
            let receiverParsed = this.calcMixChannel(receiver.msb, receiver.lsb);
            let valueParsed = new ValueLevel(this.decode(value.vc, value.vf));
            if(receiverParsed.mix === "lr") {
                this.receiver.forEach((callback) => {
                    callback(receiverParsed.channel, valueParsed);
                });
            } else {
                this.receiverMix.forEach((callback) => {
                    callback(receiverParsed.mix, receiverParsed.channel, valueParsed);
                });
            }
        }
    }

    /**
     * Add Callback if not main mix execute if data is received
     * @param callback Callback Function
     */
    addCallbackReiceveMix(callback: ICallbackMixValue) : void {
        this.receiverMix.push(callback);
    }
    
    /**
     * Calculates the Address from given mix and channel
     * @param mix Mixes Enum LR, Aux1 - Aux12
     * @param channel Input number 1 - 48 (e.g. Ip1)
     * @returns object from msb and lsb
     */
    private calcAddress(mix: "lr" | IMix, channel: number) : {msb: number, lsb: number} {
        let msb : number = 0x40;
        let lsb : number = channel-1;

        if(mix !== "lr" && mix.mixType === "aux") {
            lsb = 0x44 + (channel-1)*12 + (mix.mix - 1);
            let ov = Math.floor(lsb / 0x80);
            if(ov > 0) {
                lsb = lsb % 0x80;
            }
            msb = msb + ov;
        }

        return {msb: msb, lsb: lsb};
    }

    /** Calculates the channel of given Adddress
     * 
     * @param msb MSB Value
     * @param lsb LSB Value
     * @returns mix and channel number 
     */
    private calcMixChannel(msb: number, lsb: number): { mix: "lr" | IMix, channel: number} {
        let mix: "lr" | IMix;
        let channel : number;

        msb = msb - 0x40; 
        if(msb === 0 && lsb >= 0x00 && lsb <=0x2f) {
            mix = "lr";
            channel = lsb+1;
        } else {
            lsb = lsb - 0x44 + msb * 0x80;
            channel = Math.floor(lsb / 12) + 1;
            mix = {mixType: "aux", mix: lsb % 12 + 1};
        }

        return {mix: mix, channel: channel};
    }

    /**
     * decode the level from vc and vf
     * @param vc Value Coarse
     * @param vf Value Fine
     * @returns Value in db (Linear Taper)
     */
    private decode(vc: number, vf: number) : number | "inf" {
        if(vc === 0 && vf === 0) {
            return "inf";
        }
        let gainAs14Bit;
        gainAs14Bit = vc << 7;
        gainAs14Bit |= vf & 0x7f;
        let scaledGain = gainAs14Bit * 4;
        let gainOffB = scaledGain * 35328 / 0xFFFF;
        return +((gainOffB - 0x8000) / 256).toFixed(1);
    }

    /**
     * encode the level from value in db (Linear Taper)
     * @param gain Level in db
     * @returns object with vc and vf
     */
    private encode(gain: ValueLevel) : {vc: number, vf: number} {
        if(gain.value === "inf") {
            return {vc: 0, vf: 0};
        }
        let gainOffB = (gain.value * 256) + 0x8000;
        let scaledGain = (gainOffB / (35328)) * 0xFFFF;
        let gain14Bit = Math.floor(Math.floor(scaledGain) / 4);
        let vf = gain14Bit & 0x7F;
        let vc = gain14Bit >> 7;
    
        return {vc: vc, vf: vf};
    }
    
}

export default ModuleSQLevelToMix;