import IValue from "../structure/iValue";
import IMix from "../structure/iMix";

interface ICallbackMixValue {
    (mix: "lr" | IMix, channel: number, value: IValue) : void;
}

export default ICallbackMixValue;