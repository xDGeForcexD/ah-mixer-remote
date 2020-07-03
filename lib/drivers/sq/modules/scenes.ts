import ModuleScenes from "../../../module/types/scenes";

class ModuleSQScenes extends ModuleScenes {
    driverRequiere: string = "SQ";

    setValue(channel: number, value: number): void {
        throw new Error("Method not implemented.");
    }
    requestValue(channel: number): void {
        throw new Error("Method not implemented.");
    }

}

export default ModuleSQScenes;