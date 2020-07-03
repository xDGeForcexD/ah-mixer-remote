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

    toSendValue(msb: number, lsb: number, vc: number, vf: number) : string {
        let data = [...this.formatValue];
        data[this.PLACE_MSB] = msb;
        data[this.PLACE_LSB] = lsb;
        data[this.PLACE_VC] = vc;
        data[this.PLACE_VF] = vf;
        return data.join(" ");
    }

    toSendDec(msb: number, lsb: number) : string {
        return this.toSendDecInc(msb, lsb, 0x61).join(" ");
    }

    toSendInc(msb: number, lsb: number) : string {
        return this.toSendDecInc(msb, lsb, 0x60).join(" ");
    }

    private toSendDecInc(msb: number, lsb: number, option: number) : number [] {
        let data = [...this.formatSimple];
        data[this.PLACE_MSB] = msb;
        data[this.PLACE_LSB] = lsb;
        data[this.PLACE_OPTION] = option;
        return data;
    }

    toGetValue(msb: number, lsb: number) : string {
        let data = this.toSendDecInc(msb, lsb, 0x60);
        data[this.PLACE_VC] = 0x7f;
        return data.join(" ");
    }
    
    isPackageForMe(data: string | {msb: number, lsb: number}) : Boolean {
        if(this.msbRange === null || this.lsbRange === null) {
            return false;
        }

        let dataParsed : {msb: number, lsb: number};
        if(typeof data === "string") {
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

    parseReceiver(data: string) : {msb: number, lsb: number} {
        let dataParsed = this.parseData(data);
        return {msb: dataParsed[this.PLACE_MSB], lsb: dataParsed[this.PLACE_LSB]};
    }

    parseValue(data: string) : {vc: number, vf: number} {
        let dataParsed = this.parseData(data);
        return {vc: dataParsed[this.PLACE_VC], vf: dataParsed[this.PLACE_VF]};
    }

    parseData(data: string) : number[] {
        let dataSplit = data.split(" ");
        let dataParsed : number[] = [];

        for(let command in dataSplit) {
            dataParsed.push(parseInt(dataSplit[command]));
        }

        return dataParsed;
    }
}

export default CommandBuilderSQ;