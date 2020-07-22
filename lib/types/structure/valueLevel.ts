import IValue from "./iValue";

class ValueLevel implements IValue {
    value: number | "inf";
    unit: string;

    constructor(value: number | "inf") {
        this.value = value;
        this.unit = "db";
    }

    toString() : string {
        return this.value+this.unit;
    }
}

export default ValueLevel;