import IValue from "./iValue";

class ValueState implements IValue {
    value: Boolean;
    unit: string;

    constructor(value: Boolean) {
        this.value = value;
        this.unit = "";
    }
    
    toString() : string {
        return this.value ? "1" : "0";
    }
}

export default ValueState;