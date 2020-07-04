import ModuleScenes from "../../../module/types/scenes";
import IValue from "../../../types/structure/iValue";

class ModuleSQScenes extends ModuleScenes {
    driverRequiere: string = "SQ";

    setValue(channel: number, value: IValue): void {
        throw new Error("Method not implemented.");
    }
    requestValue(channel: number): void {
        throw new Error("Method not implemented.");
    }

}

export default ModuleSQScenes;