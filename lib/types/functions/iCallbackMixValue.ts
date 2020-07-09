import IValue from "../structure/iValue";
import Mixes from "../enums/mixes";

interface ICallbackMixValue {
    (mix: Mixes, channel: number, value: IValue) : void;
}

export default ICallbackMixValue;