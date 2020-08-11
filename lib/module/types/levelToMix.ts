import Module from "../module";
import { ValueLevel } from "../../types/types";

abstract class ModuleLevelToMix extends Module {
    key : string = "levelToMix";

    abstract setValueMix(mix: any, channel: number, value: ValueLevel): void;
    abstract requestValueMix(mix: any, channel: number): void;
}

export default ModuleLevelToMix;