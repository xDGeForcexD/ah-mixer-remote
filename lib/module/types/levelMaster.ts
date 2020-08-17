import Module from "../module";
import { ValueLevel } from "../../types/types";
import IMix from "../../types/structure/iMix";

abstract class ModuleLevelMaster extends Module {
    key: string = "levelMaster";

    abstract setValueMix(mix: "lr" | IMix, value: ValueLevel): void;
    abstract requestValueMix(mix: "lr" | IMix): void;
}

export default ModuleLevelMaster;