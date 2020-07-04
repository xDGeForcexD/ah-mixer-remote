import IValue from "./iValue";

class ValueLevel implements IValue {
    value: number;
    unit: string;

    constructor(value: number) {
        this.value = value;
        this.unit = "db";
    }
}

export default ValueLevel;