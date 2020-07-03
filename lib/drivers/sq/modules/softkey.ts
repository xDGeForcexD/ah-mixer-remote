import ModuleSoftkey from "../../../module/types/softkey";

class ModuleSQSoftkey extends ModuleSoftkey {
    driverRequiere: string = "sq";

    setValue(channel: number, value: number): void {
        throw new Error("Method not implemented.");
    }
    requestValue(channel: number): void {
        throw new Error("Method not implemented.");
    }

}

export default ModuleSQSoftkey;