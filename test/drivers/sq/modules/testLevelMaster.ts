import { expect } from "chai";
import { ImportMock, MockManager } from "ts-mock-imports";
import * as Communicator from "../../../../lib/communicator/communicator";
import * as CommandBuilderSQ from "../../../../lib/drivers/sq/commandBuilder";
import * as DriverSQ from "../../../../lib/drivers/sq/driver";
import ModuleSQLevelMaster from "../../../../lib/drivers/sq/modules/levelMaster";
import Mixes from "../../../../lib/types/enums/mixes";
import ValueLevel from "../../../../lib/types/structure/valueLevel";
import Driver from "../../../../lib/driver/driver";
import IValue from "../../../../lib/types/structure/iValue";

const sinon = require("sinon");

describe("TestModuleSQLevelMaster", function() {
    let communicatorMock : MockManager<Communicator.default>;
    let commandBuilderMock : MockManager<CommandBuilderSQ.default>;
    let driverMock : MockManager<Driver>
    let driver : Driver;
    let communicator : Communicator.default;
    let commandBuilder : CommandBuilderSQ.default;
    let levelMaster : ModuleSQLevelMaster;

    const sandbox = sinon.createSandbox();
    beforeEach(function() {
        communicatorMock = ImportMock.mockClass(Communicator);
        commandBuilderMock = ImportMock.mockClass(CommandBuilderSQ);
        driverMock = ImportMock.mockClass(DriverSQ);  
        driver = new DriverSQ.default("111.222.333.444",1234);
        communicator = new Communicator.default(driver);
        commandBuilder = new CommandBuilderSQ.default();
        levelMaster = new ModuleSQLevelMaster(commandBuilder);
    });

    afterEach(function() {
        communicatorMock.restore();
        commandBuilderMock.restore();
        driverMock.restore();
    });

    it("setValue", function() {
        let setValueMixStub = sinon.stub(levelMaster, 'setValueMix');
        setValueMixStub.callsFake(function() {});

        let value = new ValueLevel(24);

        levelMaster.setValue(3, value);

        expect(setValueMixStub.calledOnceWith(Mixes.Aux3, value)).to.be.true;
    });

    it("setValueMix LR", function() {
        let writeStub = communicatorMock.mock("write", "");
        writeStub.callsFake(function(data: string) {});

        let data = new Uint8Array([1,2,3,4]);

        let sendStub = commandBuilderMock.mock("toSendValue", data);
        sendStub.callsFake(function(msb: number, lsb: number, vc: number, vf: number) : Uint8Array {
            expect(msb, "msb").to.be.eq(0x4f);
            expect(lsb, "lsb").to.be.eq(0x00);
            expect(vc, "vc").to.be.eq(0x7b);
            expect(vf, "vf").to.satisfy(function(num: number) { return num >= 0x2d && num <= 0x2f; });
            return data;
        });

        let value = new ValueLevel(5);

        levelMaster.setCommunicator(communicator);
        levelMaster.setValueMix(Mixes.LR, value);

        expect(sendStub.calledOnce, "called commandBuilder").to.be.true;
        expect(writeStub.calledOnceWith(data), "called communicator write").to.be.true;
    });

    it("setValueMix Aux 3", function() {
        let writeStub = communicatorMock.mock("write", "");
        writeStub.callsFake(function(data: string) {});

        let data = new Uint8Array([5,3,5,6]);

        let sendStub = commandBuilderMock.mock("toSendValue", data);
        sendStub.callsFake(function(msb: number, lsb: number, vc: number, vf: number) : Uint8Array {
            expect(msb, "msb").to.be.eq(0x4f);
            expect(lsb, "lsb").to.be.eq(0x03);
            expect(vc, "vc").to.be.eq(0x53);
            expect(vf, "vf").to.satisfy(function(num: number) { return num >= 0x3b && num <= 0x3d; });
            return data;
        });

        let value = new ValueLevel(-38);

        levelMaster.setCommunicator(communicator);
        levelMaster.setValueMix(Mixes.Aux3, value);

        expect(sendStub.calledOnce, "called commandBuilder").to.be.true;
        expect(writeStub.calledOnceWith(data), "called communicator write").to.be.true;
    });

    it("setValueMix Aux 8", function() {
        let writeStub = communicatorMock.mock("write", "");
        writeStub.callsFake(function(data: string) {});

        let data = new Uint8Array([8,7,6,5]);

        let sendStub = commandBuilderMock.mock("toSendValue", data);
        sendStub.callsFake(function(msb: number, lsb: number, vc: number, vf: number) : Uint8Array {
            expect(msb, "msb").to.be.eq(0x4f);
            expect(lsb, "lsb").to.be.eq(0x08);
            expect(vc, "vc").to.be.eq(0x6d);
            expect(vf, "vf").to.satisfy(function(num: number) { return num >= 0x38 && num <= 0x3A; });
            return data;
        });

        let value = new ValueLevel(-10);

        levelMaster.setCommunicator(communicator);
        levelMaster.setValueMix(Mixes.Aux8, value);

        expect(sendStub.calledOnce, "called commandBuilder").to.be.true;
        expect(writeStub.calledOnceWith(data), "called communicator write").to.be.true;
    });

    it("setValueMix throw no communicator", function() {
        let value = new ValueLevel(10);
        let valueMixCall = sinon.spy(levelMaster, "setValueMix");
        try {
            levelMaster.setValueMix(Mixes.Aux11, value);
          } catch (e) {
              expect(e.message).to.be.eq("no communicator is set");
          }
        expect(valueMixCall.threw()).to.be.true;        
    });

    it("setValueMix throw invalid mix", function() {
        let value = new ValueLevel(10);
        levelMaster.setCommunicator(communicator);
        let valueMixCall = sinon.spy(levelMaster, "setValue");
        try {
            levelMaster.setValue(84, value);
          } catch (e) {
              expect(e.message).to.be.eq("wrong channel input");
          }
        expect(valueMixCall.threw()).to.be.true;  
    });

    it("requestValue", function() {
        let requestValueMixStub = sinon.stub(levelMaster, 'requestValueMix');
        requestValueMixStub.callsFake(function() {});

        levelMaster.requestValue(2);

        expect(requestValueMixStub.calledOnceWith(Mixes.Aux2)).to.be.true;
    });

    it("requestValueMix Aux 5", function() {
        let writeStub = communicatorMock.mock("write", "");
        writeStub.callsFake(function(data: string) {});

        let data = new Uint8Array([1,2,3,4]);

        let sendStub = commandBuilderMock.mock("toGetValue", data);
        sendStub.callsFake(function(msb: number, lsb: number) : Uint8Array {
            expect(msb, "msb").to.be.eq(0x4f);
            expect(lsb, "lsb").to.be.eq(0x05);
            return data;
        });

        levelMaster.setCommunicator(communicator);
        levelMaster.requestValueMix(Mixes.Aux5);

        expect(sendStub.calledOnce, "called commandBuilder").to.be.true;
        expect(writeStub.calledOnceWith(data), "called communicator write").to.be.true;
    });

    it("requestValue throw no communicator", function() {
        let value = new ValueLevel(0);
        let reguestCall = sinon.spy(levelMaster, "requestValueMix");
        try {
            levelMaster.requestValueMix(Mixes.Aux11);
          } catch (e) {
              expect(e.message).to.be.eq("no communicator is set");
          }
        expect(reguestCall.threw()).to.be.true;        
    });

    it("requestValue throw invalid channel", function() {
        let value = new ValueLevel(-9);
        levelMaster.setCommunicator(communicator);
        let reguestCall = sinon.spy(levelMaster, "requestValue");
        try {
            levelMaster.requestValue(-54);
          } catch (e) {
              expect(e.message).to.be.eq("wrong channel input");
          }
        expect(reguestCall.threw()).to.be.true;  
    });

    it("incValue", function() {
        let incValueMixStub = sinon.stub(levelMaster, 'incValueMix');
        incValueMixStub.callsFake(function() {});

        levelMaster.incValue(7);

        expect(incValueMixStub.calledOnceWith(Mixes.Aux7)).to.be.true;
    });

    it("incValueMix", function() {
        let writeStub = communicatorMock.mock("write", "");
        writeStub.callsFake(function(data: string) {});

        let data = new Uint8Array([1,2,3,4]);

        let sendStub = commandBuilderMock.mock("toSendInc", data);
        sendStub.callsFake(function(msb: number, lsb: number) : Uint8Array {
            expect(msb, "msb").to.be.eq(0x4f);
            expect(lsb, "lsb").to.be.eq(0x0b);
            return data;
        });

        levelMaster.setCommunicator(communicator);
        levelMaster.incValueMix(Mixes.Aux11);

        expect(sendStub.calledOnce, "called commandBuilder").to.be.true;
        expect(writeStub.calledOnceWith(data), "called communicator write").to.be.true;
    });

    it("decValue", function() {
        let decValueMixStub = sinon.stub(levelMaster, 'decValueMix');
        decValueMixStub.callsFake(function() {});

        levelMaster.decValue(3);

        expect(decValueMixStub.calledOnceWith(Mixes.Aux3)).to.be.true;
    });

    it("decValueMix", function() {
        let writeStub = communicatorMock.mock("write", "");
        writeStub.callsFake(function(data: string) {});

        let data = new Uint8Array([6,44,42,87]);

        let sendStub = commandBuilderMock.mock("toSendDec", data);
        sendStub.callsFake(function(msb: number, lsb: number) : Uint8Array {
            expect(msb, "msb").to.be.eq(0x4f);
            expect(lsb, "lsb").to.be.eq(0x00);
            return data;
        });

        levelMaster.setCommunicator(communicator);
        levelMaster.decValueMix(Mixes.LR);

        expect(sendStub.calledOnce, "called commandBuilder").to.be.true;
        expect(writeStub.calledOnceWith(data), "called communicator write").to.be.true;
    });

    it("callbackReceive", function() {
        commandBuilderMock.mock("isPackageForMe",true);
        commandBuilderMock.mock("parseReceiver", {msb: 0x4f, lsb: 0x05});
        commandBuilderMock.mock("parseValue", {vc: 0x3a, vf: 0x37});

        let data = new Uint8Array([1,2,3,4]);

        let calls = 0;
        levelMaster.addCallbackReiceve((channel: number, value: IValue) => {
            expect(channel, "receiver1").to.be.eq(5);
            expect(value.value).to.be.eq(-65);
            calls++;
        });
        levelMaster.addCallbackReiceve((channel: number, value: IValue) => {
            expect(channel, "receiver2").to.be.eq(5);
            expect(value.value).to.be.eq(-65);
            calls++;
        });

        levelMaster.callbackReceive(data);
        expect(calls).to.be.eq(2);
    });

    it("callbackReceive inf", function() {
        commandBuilderMock.mock("isPackageForMe",true);
        commandBuilderMock.mock("parseReceiver", {msb: 0x4f, lsb: 0x07});
        commandBuilderMock.mock("parseValue", {vc: 0x00, vf: 0x00});

        let data = new Uint8Array([1,2,3,4]);

        let calls = 0;
        levelMaster.addCallbackReiceve((channel: number, value: IValue) => {
            expect(channel, "receiver1").to.be.eq(7);
            expect(value.value).to.be.eq("inf");
            calls++;
        });
        levelMaster.addCallbackReiceve((channel: number, value: IValue) => {
            expect(channel, "receiver2").to.be.eq(7);
            expect(value.value).to.be.eq("inf");
            calls++;
        });

        levelMaster.callbackReceive(data);
        expect(calls).to.be.eq(2);
    });
});