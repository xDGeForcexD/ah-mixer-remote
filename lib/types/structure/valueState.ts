import IValue from "./iValue";

class ValueState implements IValue {
    value: Boolean;
    unit: string;

    constructor(value: Boolean) {
        this.value = value;
        this.unit = "";
    }
}

export default ValueState;