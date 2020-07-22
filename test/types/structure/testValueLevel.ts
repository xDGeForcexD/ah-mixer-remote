import { expect } from "chai";

import ValueLevel from "../../../lib/types/structure/valueLevel";

describe("TestValueLevel", function() {
    it("toString", function() {
        let value = new ValueLevel(1);
        expect(String(value)).to.be.eq("1db");
    });

    it("toString", function() {
        let value = new ValueLevel("inf");
        expect(String(value)).to.be.eq("infdb");
    });
});