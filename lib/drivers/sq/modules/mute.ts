import ModuleMute from "../../../module/types/mute";
import IValue from "../../../types/structure/iValue";
import CommandBuilderSQ from "../commandBuilder";
import ValueState from "../../../types/structure/valueState";

class ModuleSQMute extends ModuleMute {
    driverRequiere: string = "sq";

    commandBuilder : CommandBuilderSQ;
    constructor(commandBuilder: CommandBuilderSQ) {
        super(commandBuilder);
        this.commandBuilder = commandBuilder;
    }
    
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

    private calcAddress(channel: number) : {msb: number, lsb: number} {
        return {msb: 0x00, lsb: channel-1};
    }

    private checkValidChannel(channel: number) : Boolean {
        if(channel > 0 && channel < 49) {
            return true;
        }
        return false;
    }

}

export default ModuleSQMute;