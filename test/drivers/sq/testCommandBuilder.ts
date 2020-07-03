import { expect } from "chai";

import CommandBuilderSQ from "../../../lib/drivers/sq/commandBuilder";

describe("TestCommandBuilderSQ", function() {
    let commandBuilder : CommandBuilderSQ;

    beforeEach(function() {
        commandBuilder = new CommandBuilderSQ(1);
    });

    afterEach(function() {

    });

    it("toSendValue", function() {
        let data = commandBuilder.toSendValue(1, 2, 3, 4);
        expect(data).to.be.eq("177 99 1 177 98 2 177 6 3 177 38 4");
    });

    it("toSendDec", function() {
        let data = commandBuilder.toSendDec(5, 8);
        expect(data).to.be.eq("177 99 5 177 98 8 177 97 0");
    });

    it("toSendInc", function() {
        let data = commandBuilder.toSendInc(3, 6);
        expect(data).to.be.eq("177 99 3 177 98 6 177 96 0");
    });

    it("toGetValue", function() {
        let data = commandBuilder.toGetValue(8, 52);
        expect(data).to.be.eq("177 99 8 177 98 52 177 96 127");
    });
    
    it("isPackageForMe (string input / no range set)", function() {
        expect(commandBuilder.isPackageForMe("177 99 3 177 98 8 177 6 3 177 38 4")).to.be.false;
    });

    it("isPackageForMe (string input / range set)", function() {
        commandBuilder.setReceiverRange({from: 10, to: 20}, {from: 5, to: 5});
        expect(commandBuilder.isPackageForMe("177 99 11 177 98 5 177 6 3 177 38 4")).to.be.true;
    });

    it("isPackageForMe (msb & lsb input / no range set)", function() {
        expect(commandBuilder.isPackageForMe({msb: 54, lsb: 41})).to.be.false;
    });

    it("isPackageForMe (msb & lsb input / range set)", function() {
        commandBuilder.setReceiverRange({from: 10, to: 20}, {from: 5, to: 5});
        expect(commandBuilder.isPackageForMe({msb: 13, lsb: 5})).to.be.true;
    });

    it("isPackageForMe (wrong msb & lsb input)", function() {
        commandBuilder.setReceiverRange({from: 10, to: 20}, {from: 5, to: 5});
        expect(commandBuilder.isPackageForMe({msb: 9, lsb: 5})).to.be.false;
    });

    it("isPackageForMe (msb & wrong lsb input)", function() {
        commandBuilder.setReceiverRange({from: 10, to: 20}, {from: 5, to: 5});
        expect(commandBuilder.isPackageForMe({msb: 14, lsb: 6})).to.be.false;
    });

    it("parseReceiver", function() {
        let data = commandBuilder.parseReceiver("177 99 3 177 98 8 177 6 3 177 38 4");
        expect(data.msb, "msb").to.be.eq(3);
        expect(data.lsb, "lsb").to.be.eq(8);
    });

    it("parseValue", function() {
        let data = commandBuilder.parseValue("177 99 1 177 98 2 177 6 6 177 38 4");
        expect(data.vc, "vc").to.be.eq(6);
        expect(data.vf, "vf").to.be.eq(4);
    });
});