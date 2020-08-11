import Module from "../module";
import { ValueLevel } from "../../types/types";

abstract class ModuleLevelMaster extends Module {
    key: string = "levelMaster";

    abstract setValueMix(mix: any, value: ValueLevel): void;
    abstract requestValueMix(mix: any): void;
}

export default ModuleLevelMaster;