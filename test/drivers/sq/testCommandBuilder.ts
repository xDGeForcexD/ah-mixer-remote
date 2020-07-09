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
        expect(data[0]).to.be.eq(177);
        expect(data[1]).to.be.eq(99);
        expect(data[2]).to.be.eq(1);
        expect(data[3]).to.be.eq(177);
        expect(data[4]).to.be.eq(98);
        expect(data[5]).to.be.eq(2);
        expect(data[6]).to.be.eq(177);
        expect(data[7]).to.be.eq(6);
        expect(data[8]).to.be.eq(3);
        expect(data[9]).to.be.eq(177);
        expect(data[10]).to.be.eq(38);
        expect(data[11]).to.be.eq(4);
    });

    it("toSendDec", function() {
        let data = commandBuilder.toSendDec(5, 8);
        expect(data[0]).to.be.eq(177);
        expect(data[1]).to.be.eq(99);
        expect(data[2]).to.be.eq(5);
        expect(data[3]).to.be.eq(177);
        expect(data[4]).to.be.eq(98);
        expect(data[5]).to.be.eq(8);
        expect(data[6]).to.be.eq(177);
        expect(data[7]).to.be.eq(97);
        expect(data[8]).to.be.eq(0);
    });

    it("toSendInc", function() {
        let data = commandBuilder.toSendInc(3, 6);
        expect(data[0]).to.be.eq(177);
        expect(data[1]).to.be.eq(99);
        expect(data[2]).to.be.eq(3);
        expect(data[3]).to.be.eq(177);
        expect(data[4]).to.be.eq(98);
        expect(data[5]).to.be.eq(6);
        expect(data[6]).to.be.eq(177);
        expect(data[7]).to.be.eq(96);
        expect(data[8]).to.be.eq(0);
    });

    it("toGetValue", function() {
        let data = commandBuilder.toGetValue(8, 52);
        expect(data[0]).to.be.eq(177);
        expect(data[1]).to.be.eq(99);
        expect(data[2]).to.be.eq(8);
        expect(data[3]).to.be.eq(177);
        expect(data[4]).to.be.eq(98);
        expect(data[5]).to.be.eq(52);
        expect(data[6]).to.be.eq(177);
        expect(data[7]).to.be.eq(96);
        expect(data[8]).to.be.eq(127);
    });

    it("isPackageForMe (string input / range set)", function() {
        expect(commandBuilder.isPackageForMe({msb: {from: 10, to: 20}, lsb: {from: 5, to: 5}}, new Uint8Array([177,99,11,177,98,5,177,6,3,177,38,4]))).to.be.true;
    });

    it("isPackageForMe (msb & lsb input / range set)", function() {
        expect(commandBuilder.isPackageForMe({msb: {from: 10, to: 20}, lsb: {from: 5, to: 5}}, {msb: 13, lsb: 5})).to.be.true;
    });

    it("isPackageForMe (wrong msb & lsb input)", function() {
        expect(commandBuilder.isPackageForMe({msb: {from: 10, to: 20}, lsb: {from: 5, to: 5}}, {msb: 9, lsb: 5})).to.be.false;
    });

    it("isPackageForMe (msb & wrong lsb input)", function() {
        expect(commandBuilder.isPackageForMe({msb: {from: 10, to: 20}, lsb: {from: 5, to: 5}}, {msb: 14, lsb: 6})).to.be.false;
    });

    it("parseReceiver", function() {
        let data = commandBuilder.parseReceiver(new Uint8Array([177,99,3,177,98,8,177,6,3,177,38,4]));
        expect(data.msb, "msb").to.be.eq(3);
        expect(data.lsb, "lsb").to.be.eq(8);
    });

    it("parseValue", function() {
        let data = commandBuilder.parseValue(new Uint8Array([177,99,3,177,98,8,177,6,6,177,38,4]));
        expect(data.vc, "vc").to.be.eq(6);
        expect(data.vf, "vf").to.be.eq(4);
    });
});