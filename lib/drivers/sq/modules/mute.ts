import ModuleMute from "../../../module/types/mute";
import IValue from "../../../types/structure/iValue";

class ModuleSQMute extends ModuleMute {
    driverRequiere: string = "sq";

    setValue(channel: number, value: IValue): void {
        throw new Error("Method not implemented.");
    }
    requestValue(channel: number): void {
        throw new Error("Method not implemented.");
    }

}

export default ModuleSQMute;