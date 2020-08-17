import Module from "../module";
import { ValueLevel } from "../../types/types";
import IMix from "../../types/structure/iMix";

abstract class ModuleLevelToMix extends Module {
    key : string = "levelToMix";

    abstract setValueMix(mix: "lr" | IMix, channel: number, value: ValueLevel): void;
    abstract requestValueMix(mix: "lr" | IMix, channel: number): void;
}

export default ModuleLevelToMix;