abstract class CommandBuilder {
    midiChannel : number = 0;

    constructor(midiChannel?: number) {
        if(midiChannel !== undefined) {
            this.midiChannel = midiChannel;
        }
    }

    abstract isPackageForMe(data: Uint8Array) : Boolean
}

export default CommandBuilder;