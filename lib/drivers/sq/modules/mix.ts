import ModuleMix from "../../../module/types/mix";

class ModuleSQMix extends ModuleMix {
    driverRequiere: string = "sq";

    setValue(channel: number, value: number): void {
        throw new Error("Method not implemented.");
    }
    requestValue(channel: number): void {
        throw new Error("Method not implemented.");
    }
    
}

export default ModuleSQMix;