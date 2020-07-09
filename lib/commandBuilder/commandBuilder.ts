import IAddressRange from "../types/structure/iAddressRange";

abstract class CommandBuilder {
    midiChannel : number = 0;

    constructor(midiChannel?: number) {
        if(midiChannel !== undefined) {
            this.midiChannel = midiChannel;
        }
    }

    abstract isPackageForMe(addressRange: IAddressRange, data: Uint8Array) : Boolean
}

export default CommandBuilder;