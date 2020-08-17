import ModuleScenes from "../../../module/types/scenes";
import IValue from "../../../types/structure/iValue";
import ValueState from "../../../types/structure/valueState";
import CommandBuilderSQ from "../commandBuilder";
import Validator from "../../../validator/validator";

class ModuleSQScenes extends ModuleScenes {
    driverRequiere: string = "sq";

    validator: Validator;
    constructor(commandBuilder: CommandBuilderSQ, validator: Validator) {
        super(commandBuilder);
        this.validator = validator;
    }
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
        this.validator.checkScene(scene);

        this.communicator.write(new Uint8Array([0xB0+this.commandBuilder.midiChannel, 0x00, Math.floor((scene-1) / 0x80), 0xC0, Math.floor((scene-1) % 0x80)]), [true, true, false, true, true, false]);
    }
    
    /**
     * Request the actual scene on the mixer
     * @param channel Scene number 1 - 300
     * @ignore requestValue option is not available
     */
    requestValue(channel: number): void {
        throw new Error("option not available");
    }

    /**
     * Callback if data receive and execute callbacks
     * @param data Data Array
     * @ignore callback for scenes not available
     */
    callbackReceive(data: Uint8Array) : void {
    }

}

export default ModuleSQScenes;