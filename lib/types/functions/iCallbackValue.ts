import IValue from "../structure/iValue";

interface ICallbackValue {
    (channel: number, value: IValue) : void;
}

export default ICallbackValue;