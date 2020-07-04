import ModuleLevelToMix from "../../../module/types/levelToMix";
import ValueLevel from "../../../types/structure/ValueLevel";
import Mixes from "../../../types/enums/Mixes";
import CommandBuilderSQ from "../commandBuilder";

class ModuleSQLevelToMix extends ModuleLevelToMix {
    driverRequiere: string = "sq";

    commandBuilder : CommandBuilderSQ;
    constructor(commandBuilder: CommandBuilderSQ) {
        super(commandBuilder);
        this.commandBuilder = commandBuilder;
    }

    setValue(channel: number, value: ValueLevel) : void {
        this.setValueMix(Mixes.LR, channel, value);
    }

    setValueMix(mix: Mixes, channel: number, value: ValueLevel) : void {
        if(this.communicator === null) {
            throw new Error("no communicator is set");
        }

        if(!this.checkValidChannel(channel)) {
            throw new Error("wrong channel input");
        }

        let address = this.calcAddress(mix, channel);
        let valueSend = this.encode(value);
        this.communicator.write(this.commandBuilder.toSendValue(address.msb, address.lsb, valueSend.vc, valueSend.vf));
    };

    incValue(channel: number) {
        this.incValueMix(Mixes.LR, channel);
    }

    incValueMix(mix: Mixes, channel: number) {
        if(this.communicator === null) {
            throw new Error("no communicator is set");
        }

        if(!this.checkValidChannel(channel)) {
            throw new Error("wrong channel input");
        }

        let address = this.calcAddress(mix, channel);
        this.communicator.write(this.commandBuilder.toSendInc(address.msb, address.lsb));
    }

    decValue(channel: number) {
        this.decValueMix(Mixes.LR, channel);
    }

    decValueMix(mix: Mixes, channel: number) {
        if(this.communicator === null) {
            throw new Error("no communicator is set");
        }

        if(!this.checkValidChannel(channel)) {
            throw new Error("wrong channel input");
        }

        let address = this.calcAddress(mix, channel);
        this.communicator.write(this.commandBuilder.toSendDec(address.msb, address.lsb));
    }

    requestValue(channel: number): void {
        this.requestValueMix(Mixes.LR, channel);
    }

    requestValueMix(mix: Mixes, channel: number) {
        if(this.communicator === null) {
            throw new Error("no communicator is set");
        }

        if(!this.checkValidChannel(channel)) {
            throw new Error("wrong channel input");
        }

        let address = this.calcAddress(mix, channel);
        this.communicator.write(this.commandBuilder.toGetValue(address.msb, address.lsb));
    }

    private calcAddress(mix: Mixes, channel: number) : {msb: number, lsb: number} {
        let msb : number = 0x40;
        let lsb : number = channel-1;

        if(mix !== Mixes.LR && mix >= Mixes.Aux1 && mix <= Mixes.Aux12) {
            lsb = 0x44 + (channel-1)*12 + (mix - 1);
            let ov = Math.floor(lsb / 0x80);
            if(ov > 0) {
                lsb = lsb % 0x80;
            }
            msb = msb + ov;
        }

        return {msb: msb, lsb: lsb};
    }

    private checkValidChannel(channel: number) : Boolean {
        if(channel > 0 && channel < 49) {
            return true;
        }
        return false;
    }

    private decode(vc: number, vf: number) : number {
        let gainAs14Bit;
        gainAs14Bit = vc << 7;
        gainAs14Bit |= vf & 0x7f;
        let scaledGain = gainAs14Bit * 4;
        let gainOffB = scaledGain * 35328 / 0xFFFF;
        return +((gainOffB - 0x8000) / 256).toFixed(1);
    }

    private encode(gain: ValueLevel) : {vc: number, vf: number} {
        let gainOffB = (gain.value * 256) + 0x8000;
        let scaledGain = (gainOffB / (35328)) * 0xFFFF;
        let gain14Bit = Math.floor(Math.floor(scaledGain) / 4);
        let vf = gain14Bit & 0x7F;
        let vc = gain14Bit >> 7;
    
        return {vc: vc, vf: vf};
    }
    
}

export default ModuleSQLevelToMix;