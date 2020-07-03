abstract class CommandBuilder {
    midiChannel : number = 0;

    constructor(midiChannel?: number) {
        if(midiChannel !== undefined) {
            this.midiChannel = midiChannel;
        }
    }
}

export default CommandBuilder;