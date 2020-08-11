import ModuleLevelMaster from "../../../module/types/levelMaster";
import ValueLevel from "../../../types/structure/valueLevel";
import Mixes from "../../../types/enums/mixes";
import CommandBuilderSQ from "../commandBuilder";
import ICallbackMixValue from "../../../types/functions/iCallbackMixValue";
import IAddressRange from "../../../types/structure/iAddressRange";

class ModuleSQLevelToMix extends ModuleLevelMaster {
    driverRequiere: string = "sq";

    addressRange: IAddressRange;

    commandBuilder: CommandBuilderSQ;
    constructor(commandBuilder: CommandBuilderSQ) {
        super(commandBuilder);
        this.commandBuilder = commandBuilder;
        this.addressRange = { msb: { from: 0x40, to: 0x45 }, lsb: { from: 0x00, to: 0x7f } };
    }

    /**
     * Takes mix number and value to set the master of mix
     * @param channel Mixes (LR = 0, Aux1..12 = 1 - 12, FX1..4 = 13 - 16)
     * @param value ValueLevel Class with Level from -inf db to +10db
     */
    setValue(channel: number, value: ValueLevel): void {
        if (Mixes[channel] === undefined) {
            throw new Error("wrong channel input");
        }

        this.setValueMix(channel, value);
    }

    /**
     * Takes mix and value to set the master of mix
     * @param mix Mixes Enum LR, Aux1 - Aux12
     * @param value ValueLevel Class with Level from -inf db to +10db
     */
    setValueMix(mix: Mixes, value: ValueLevel): void {
        if (this.communicator === null) {
            throw new Error("no communicator is set");
        }

        let address = this.calcAddress(mix);
        let valueSend = this.encode(value);
        this.communicator.write(this.commandBuilder.toSendValue(address.msb, address.lsb, valueSend.vc, valueSend.vf), [true, true, true, true, true, true, true, true, false, true, true, false]);
    };

    /**
     * Takes a mix number to send level increment of 1db on master of the mix
     * @param channel Mixes (LR = 0, Aux1..12 = 1 - 12, FX1..4 = 13 - 16)
     */
    incValue(channel: number) {
        if (Mixes[channel] === undefined) {
            throw new Error("wrong channel input");
        }

        this.incValueMix(channel);
    }

    /**
     * Takes mix to send level increment of 1db on master of the mix
     * @param mix Mixes Enum LR, Aux1 - Aux12
     */
    incValueMix(mix: Mixes) {
        if (this.communicator === null) {
            throw new Error("no communicator is set");
        }

        let address = this.calcAddress(mix);
        this.communicator.write(this.commandBuilder.toSendInc(address.msb, address.lsb));
    }

    /**
     * Takes a mix number to send level decrement of 1db on master of the mix
     * @param channel Mixes (LR = 0, Aux1..12 = 1 - 12, FX1..4 = 13 - 16)
     */
    decValue(channel: number) {
        if (Mixes[channel] === undefined) {
            throw new Error("wrong channel input");
        }

        this.decValueMix(channel);
    }

    /**
     * Takes mix to send level decrement of 1db on master of the mix
     * @param mix Mixes Enum LR, Aux1 - Aux12
     */
    decValueMix(mix: Mixes) {
        if (this.communicator === null) {
            throw new Error("no communicator is set");
        }

        let address = this.calcAddress(mix);
        this.communicator.write(this.commandBuilder.toSendDec(address.msb, address.lsb));
    }

    /**
     * Takes a mix number to request the level on master of the mix
     * @param channel Mixes (LR = 0, Aux1..12 = 1 - 12, FX1..4 = 13 - 16)
     */
    requestValue(channel: number): void {
        if (Mixes[channel] === undefined) {
            throw new Error("wrong channel input");
        }

        this.requestValueMix(channel);
    }

    /**
     * Takes mix to request the level on the master of mix
     * @param mix Mixes Enum LR, Aux1 - Aux12
     */
    requestValueMix(mix: Mixes) {
        if (this.communicator === null) {
            throw new Error("no communicator is set");
        }

        let address = this.calcAddress(mix);
        this.communicator.write(this.commandBuilder.toGetValue(address.msb, address.lsb), [true, true, true, true, true, true, true, true, true]);
    }

    /**
     * Callback if data receive and execute callbacks
     * @param data Data Array
     */
    callbackReceive(data: Uint8Array): void {
        if (this.commandBuilder.isPackageForMe(this.addressRange, data)) {
            let receiver = this.commandBuilder.parseReceiver(data);
            let value = this.commandBuilder.parseValue(data);
            let receiverParsed = this.calcMix(receiver.msb, receiver.lsb);
            let valueParsed = new ValueLevel(this.decode(value.vc, value.vf));
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
    private calcAddress(mix: Mixes): { msb: number, lsb: number } {
        let msb: number = 0x4f;
        let lsb: number = mix;
        
        return { msb: msb, lsb: lsb };
    }

    /** Calculates the channel of given Adddress
     * 
     * @param msb MSB Value
     * @param lsb LSB Value
     * @returns mix and channel number 
     */
    private calcMix(msb: number, lsb: number): Mixes {
        return lsb;
    }

    /**
     * decode the level from vc and vf
     * @param vc Value Coarse
     * @param vf Value Fine
     * @returns Value in db (Linear Taper)
     */
    private decode(vc: number, vf: number): number | "inf" {
        if (vc === 0 && vf === 0) {
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
    private encode(gain: ValueLevel): { vc: number, vf: number } {
        if (gain.value === "inf") {
            return { vc: 0, vf: 0 };
        }
        let gainOffB = (gain.value * 256) + 0x8000;
        let scaledGain = (gainOffB / (35328)) * 0xFFFF;
        let gain14Bit = Math.floor(Math.floor(scaledGain) / 4);
        let vf = gain14Bit & 0x7F;
        let vc = gain14Bit >> 7;

        return { vc: vc, vf: vf };
    }

}

export default ModuleSQLevelToMix;