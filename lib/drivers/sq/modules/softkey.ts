import ModuleSoftkey from "../../../module/types/softkey";
import IValue from "../../../types/structure/iValue";

class ModuleSQSoftkey extends ModuleSoftkey {
    driverRequiere: string = "sq";

    setValue(channel: number, value: IValue): void {
        throw new Error("Method not implemented.");
    }
    requestValue(channel: number): void {
        throw new Error("Method not implemented.");
    }

}

export default ModuleSQSoftkey;