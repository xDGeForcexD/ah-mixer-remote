import { expect } from "chai";
import { ImportMock, MockManager } from "ts-mock-imports";
import * as Communicator from "../../../../lib/communicator/communicator";
import * as CommandBuilderSQ from "../../../../lib/drivers/sq/commandBuilder";
import * as DriverSQ from "../../../../lib/drivers/sq/driver";
import ModuleSQLevelToMix from "../../../../lib/drivers/sq/modules/levelToMix";
import Mixes from "../../../../lib/types/enums/mixes";
import ValueLevel from "../../../../lib/types/structure/valueLevel";
import Driver from "../../../../lib/driver/driver";

const sinon = require("sinon");

describe("TestModuleSQLevelToMix", function() {
    let communicatorMock : MockManager<Communicator.default>;
    let commandBuilderMock : MockManager<CommandBuilderSQ.default>;
    let driverMock : MockManager<Driver>
    let driver : Driver;
    let communicator : Communicator.default;
    let commandBuilder : CommandBuilderSQ.default;
    let levelToMix : ModuleSQLevelToMix;

    const sandbox = sinon.createSandbox();
    beforeEach(function() {
        communicatorMock = ImportMock.mockClass(Communicator);
        commandBuilderMock = ImportMock.mockClass(CommandBuilderSQ);
        driverMock = ImportMock.mockClass(DriverSQ);  
        driver = new DriverSQ.default("111.222.333.444",1234);
        communicator = new Communicator.default(driver);
        commandBuilder = new CommandBuilderSQ.default();
        levelToMix = new ModuleSQLevelToMix(commandBuilder);
    });

    afterEach(function() {
        communicatorMock.restore();
        commandBuilderMock.restore();
        driverMock.restore();
    });

    it("setValue", function() {
        let setValueMixStub = sinon.stub(levelToMix, 'setValueMix');
        setValueMixStub.callsFake(function() {});

        let value = new ValueLevel(24);

        levelToMix.setValue(3, value);

        expect(setValueMixStub.calledOnceWith(Mixes.LR, 3, value)).to.be.true;
    });

    it("setValueMix LR", function() {
        let writeStub = communicatorMock.mock("write", "");
        writeStub.callsFake(function(data: string) {});

        let data = new Uint8Array([1,2,3,4]);

        let sendStub = commandBuilderMock.mock("toSendValue", data);
        sendStub.callsFake(function(msb: number, lsb: number, vc: number, vf: number) : Uint8Array {
            expect(msb, "msb").to.be.eq(0x40);
            expect(lsb, "lsb").to.be.eq(0x1a);
            expect(vc, "vc").to.be.eq(0x7b);
            expect(vf, "vf").to.satisfy(function(num: number) { return num >= 0x2d && num <= 0x2f; });
            return data;
        });

        let value = new ValueLevel(5);

        levelToMix.setCommunicator(communicator);
        levelToMix.setValueMix(Mixes.LR, 27, value);

        expect(sendStub.calledOnce, "called commandBuilder").to.be.true;
        expect(writeStub.calledOnceWith(data), "called communicator write").to.be.true;
    });

    it("setValueMix Aux 3", function() {
        let writeStub = communicatorMock.mock("write", "");
        writeStub.callsFake(function(data: string) {});

        let data = new Uint8Array([5,3,5,6]);

        let sendStub = commandBuilderMock.mock("toSendValue", data);
        sendStub.callsFake(function(msb: number, lsb: number, vc: number, vf: number) : Uint8Array {
            expect(msb, "msb").to.be.eq(0x40);
            expect(lsb, "lsb").to.be.eq(0x76);
            expect(vc, "vc").to.be.eq(0x53);
            expect(vf, "vf").to.satisfy(function(num: number) { return num >= 0x3b && num <= 0x3d; });
            return data;
        });

        let value = new ValueLevel(-38);

        levelToMix.setCommunicator(communicator);
        levelToMix.setValueMix(Mixes.Aux3, 5, value);

        expect(sendStub.calledOnce, "called commandBuilder").to.be.true;
        expect(writeStub.calledOnceWith(data), "called communicator write").to.be.true;
    });

    it("setValueMix Aux 8", function() {
        let writeStub = communicatorMock.mock("write", "");
        writeStub.callsFake(function(data: string) {});

        let data = new Uint8Array([8,7,6,5]);

        let sendStub = commandBuilderMock.mock("toSendValue", data);
        sendStub.callsFake(function(msb: number, lsb: number, vc: number, vf: number) : Uint8Array {
            expect(msb, "msb").to.be.eq(0x43);
            expect(lsb, "lsb").to.be.eq(0x57);
            expect(vc, "vc").to.be.eq(0x6d);
            expect(vf, "vf").to.satisfy(function(num: number) { return num >= 0x38 && num <= 0x3A; });
            return data;
        });

        let value = new ValueLevel(-10);

        levelToMix.setCommunicator(communicator);
        levelToMix.setValueMix(Mixes.Aux8, 34, value);

        expect(sendStub.calledOnce, "called commandBuilder").to.be.true;
        expect(writeStub.calledOnceWith(data), "called communicator write").to.be.true;
    });

    it("setValueMix throw no communicator", function() {
        let value = new ValueLevel(10);
        let valueMixCall = sinon.spy(levelToMix, "setValueMix");
        try {
            levelToMix.setValueMix(Mixes.Aux11, 13, value);
          } catch (e) {
              expect(e.message).to.be.eq("no communicator is set");
          }
        expect(valueMixCall.threw()).to.be.true;        
    });

    it("setValueMix throw invalid channel", function() {
        let value = new ValueLevel(10);
        levelToMix.setCommunicator(communicator);
        let valueMixCall = sinon.spy(levelToMix, "setValueMix");
        try {
            levelToMix.setValueMix(Mixes.Aux11, 49, value);
          } catch (e) {
              expect(e.message).to.be.eq("wrong channel input");
          }
        expect(valueMixCall.threw()).to.be.true;  
    });

    it("requestValue", function() {
        let requestValueMixStub = sinon.stub(levelToMix, 'requestValueMix');
        requestValueMixStub.callsFake(function() {});

        levelToMix.requestValue(2);

        expect(requestValueMixStub.calledOnceWith(Mixes.LR, 2)).to.be.true;
    });

    it("requestValueMix Aux 5", function() {
        let writeStub = communicatorMock.mock("write", "");
        writeStub.callsFake(function(data: string) {});

        let data = new Uint8Array([1,2,3,4]);

        let sendStub = commandBuilderMock.mock("toGetValue", data);
        sendStub.callsFake(function(msb: number, lsb: number) : Uint8Array {
            expect(msb, "msb").to.be.eq(0x44);
            expect(lsb, "lsb").to.be.eq(0x34);
            return data;
        });

        levelToMix.setCommunicator(communicator);
        levelToMix.requestValueMix(Mixes.Aux5, 42);

        expect(sendStub.calledOnce, "called commandBuilder").to.be.true;
        expect(writeStub.calledOnceWith(data), "called communicator write").to.be.true;
    });

    it("requestValue throw no communicator", function() {
        let value = new ValueLevel(0);
        let reguestCall = sinon.spy(levelToMix, "requestValueMix");
        try {
            levelToMix.requestValueMix(Mixes.Aux11, 54);
          } catch (e) {
              expect(e.message).to.be.eq("no communicator is set");
          }
        expect(reguestCall.threw()).to.be.true;        
    });

    it("requestValue throw invalid channel", function() {
        let value = new ValueLevel(-9);
        levelToMix.setCommunicator(communicator);
        let reguestCall = sinon.spy(levelToMix, "requestValueMix");
        try {
            levelToMix.requestValueMix(Mixes.Aux4, 0);
          } catch (e) {
              expect(e.message).to.be.eq("wrong channel input");
          }
        expect(reguestCall.threw()).to.be.true;  
    });

    it("incValue", function() {
        let incValueMixStub = sinon.stub(levelToMix, 'incValueMix');
        incValueMixStub.callsFake(function() {});

        levelToMix.incValue(7);

        expect(incValueMixStub.calledOnceWith(Mixes.LR, 7)).to.be.true;
    });

    it("incValueMix", function() {
        let writeStub = communicatorMock.mock("write", "");
        writeStub.callsFake(function(data: string) {});

        let data = new Uint8Array([1,2,3,4]);

        let sendStub = commandBuilderMock.mock("toSendInc", data);
        sendStub.callsFake(function(msb: number, lsb: number) : Uint8Array {
            expect(msb, "msb").to.be.eq(0x42);
            expect(lsb, "lsb").to.be.eq(0x3e);
            return data;
        });

        levelToMix.setCommunicator(communicator);
        levelToMix.incValueMix(Mixes.Aux11, 21);

        expect(sendStub.calledOnce, "called commandBuilder").to.be.true;
        expect(writeStub.calledOnceWith(data), "called communicator write").to.be.true;
    });

    it("decValue", function() {
        let decValueMixStub = sinon.stub(levelToMix, 'decValueMix');
        decValueMixStub.callsFake(function() {});

        levelToMix.decValue(32);

        expect(decValueMixStub.calledOnceWith(Mixes.LR, 32)).to.be.true;
    });

    it("decValueMix", function() {
        let writeStub = communicatorMock.mock("write", "");
        writeStub.callsFake(function(data: string) {});

        let data = new Uint8Array([6,44,42,87]);

        let sendStub = commandBuilderMock.mock("toSendDec", data);
        sendStub.callsFake(function(msb: number, lsb: number) : Uint8Array {
            expect(msb, "msb").to.be.eq(0x40);
            expect(lsb, "lsb").to.be.eq(0x02);
            return data;
        });

        levelToMix.setCommunicator(communicator);
        levelToMix.decValueMix(Mixes.LR, 3);

        expect(sendStub.calledOnce, "called commandBuilder").to.be.true;
        expect(writeStub.calledOnceWith(data), "called communicator write").to.be.true;
    });

    it("callbackReceive", function() {
        commandBuilderMock.mock("isPackageForMe",true);

        let data = new Uint8Array([1,2,3,4]);

        let calls = 0;
        levelToMix.addCallbackReiceve((data: Uint8Array) => {
            expect(data, "receiver1").to.be.eq(data);
            calls++;
        });
        levelToMix.addCallbackReiceve((data: Uint8Array) => {
            expect(data, "receiver2").to.be.eq(data);
            calls++;
        });

        levelToMix.callbackReceive(data);
        expect(calls).to.be.eq(2);
    });
});