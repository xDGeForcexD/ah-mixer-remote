import CommandBuilder from "../../commandBuilder/commandBuilder";

class CommandBuilderSQ extends CommandBuilder {
    private readonly formatValue : number[] = [0xB0, 0x63, 0x00, 0xB0, 0x62, 0x00, 0xB0, 0x06, 0x00, 0xB0, 0x26, 0x00];
    private readonly formatSimple : number[] = [0xB0, 0x63, 0x00, 0xB0, 0x62, 0x00, 0xB0, 0x60, 0x00];

    private readonly PLACE_MSB = 2;
    private readonly PLACE_LSB = 5;
    private readonly PLACE_OPTION = 7;
    private readonly PLACE_VC = 8;
    private readonly PLACE_VF = 11;

    msbRange : {from: number, to: number} | null = null;
    lsbRange : {from: number, to: number} | null = null;

    constructor(midiChannel?: number) {
        super(midiChannel);
        this.changeMidiChannel(this.midiChannel);
    }

    private changeMidiChannel(channel: number) {
        this.formatValue[0] = this.formatSimple[0] = 0xB0 + channel;
        this.formatValue[3] = this.formatSimple[3] = 0xB0 + channel;
        this.formatValue[6] = this.formatSimple[6] = 0xB0 + channel;
        this.formatValue[9] = 0xB0 + channel;
    }

    setReceiverRange(msbRange: {from: number, to: number}, lsbRange: {from: number, to: number}) : void {
        this.msbRange = msbRange;
        this.lsbRange = lsbRange;
    }

    toSendValue(msb: number, lsb: number, vc: number, vf: number) : Uint8Array {
        let data = [...this.formatValue];
        data[this.PLACE_MSB] = msb;
        data[this.PLACE_LSB] = lsb;
        data[this.PLACE_VC] = vc;
        data[this.PLACE_VF] = vf;
        return new Uint8Array(data);
    }

    toSendDec(msb: number, lsb: number) : Uint8Array {
        return new Uint8Array(this.toSendDecInc(msb, lsb, 0x61));
    }

    toSendInc(msb: number, lsb: number) : Uint8Array {
        return new Uint8Array(this.toSendDecInc(msb, lsb, 0x60));
    }

    private toSendDecInc(msb: number, lsb: number, option: number) : number [] {
        let data = [...this.formatSimple];
        data[this.PLACE_MSB] = msb;
        data[this.PLACE_LSB] = lsb;
        data[this.PLACE_OPTION] = option;
        return data;
    }

    toGetValue(msb: number, lsb: number) : Uint8Array {
        let data = this.toSendDecInc(msb, lsb, 0x60);
        data[this.PLACE_VC] = 0x7f;
        return new Uint8Array(data);
    }
    
    isPackageForMe(data: Uint8Array | {msb: number, lsb: number}) : Boolean {
        if(this.msbRange === null || this.lsbRange === null) {
            return false;
        }

        let dataParsed : {msb: number, lsb: number};
        if(data instanceof Uint8Array) {
            dataParsed = this.parseReceiver(data);
        } else {
            dataParsed = data;
        }

        if(this.msbRange.from <= dataParsed.msb && this.msbRange.to >= dataParsed.msb) {
            if(this.lsbRange.from <= dataParsed.lsb && this.lsbRange.to >= dataParsed.lsb) {
                return true;
            }
        }
        
        return false;
    }

    parseReceiver(data: Uint8Array) : {msb: number, lsb: number} {
        return {msb: data[this.PLACE_MSB], lsb: data[this.PLACE_LSB]};
    }

    parseValue(data: Uint8Array) : {vc: number, vf: number} {
        return {vc: data[this.PLACE_VC], vf: data[this.PLACE_VF]};
    }
}

export default CommandBuilderSQ;