import ModuleScenes from "../../../module/types/scenes";
import IValue from "../../../types/structure/iValue";
import ValueState from "../../../types/structure/valueState";

class ModuleSQScenes extends ModuleScenes {
    driverRequiere: string = "sq";
    
    /**
     * Takes scene number and value to change the scene on the mixer
     * @param channel Scene number 1 - 300
     * @param value ValueState Class with true / false (only by true the scene is changed)
     */
    setValue(channel: number, value: ValueState): void {
        if(value.value) {
            this.setScene(channel);
        }
    }
    
    /**
     * Takes scene number to change the scene on the mixer
     * @param channel Scene number 1 - 300
     */
    setScene(scene: number) {
        if(this.communicator === null) {
            throw new Error("no communicator is set");
        }

        if(scene < 1 || scene > 300) {
            throw new Error("wrong scene input");
        }

        this.communicator.write(new Uint8Array([0xB0+this.commandBuilder.midiChannel, 0x00, Math.floor((scene-1) / 0x80), 0xC0, Math.floor((scene-1) % 0x80)]));
    }
    
    /**
     * Request the actual scene on the mixer
     * @param channel Scene number 1 - 300
     * @ignore requestValue option is not available
     */
    requestValue(channel: number): void {
        throw new Error("option not available");
    }

}

export default ModuleSQScenes;