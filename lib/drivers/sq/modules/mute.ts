import ModuleMute from "../../../module/types/mute";

class ModuleSQMute extends ModuleMute {
    driverRequiere: string = "sq";

    setValue(channel: number, value: number): void {
        throw new Error("Method not implemented.");
    }
    requestValue(channel: number): void {
        throw new Error("Method not implemented.");
    }

}

export default ModuleSQMute;