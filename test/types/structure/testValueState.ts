import { expect } from "chai";

import ValueState from "../../../lib/types/structure/valueState";

describe("TestValueState", function() {
    it("toString true", function() {
        let value = new ValueState(true);
        expect(String(value)).to.be.eq("1");
    });

    it("toString false", function() {
        let value = new ValueState(false);
        expect(String(value)).to.be.eq("0");
    });
});