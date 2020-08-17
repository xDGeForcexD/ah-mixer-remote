import { expect } from "chai";
import { ImportMock, MockManager } from "ts-mock-imports";
import * as Communicator from "../../../../lib/communicator/communicator";
import * as CommandBuilderSQ from "../../../../lib/drivers/sq/commandBuilder";
import * as DriverSQ from "../../../../lib/drivers/sq/driver";
import ModuleSQLevelMaster from "../../../../lib/drivers/sq/modules/levelMaster";
import ValueLevel from "../../../../lib/types/structure/valueLevel";
import Driver from "../../../../lib/driver/driver";
import IValue from "../../../../lib/types/structure/iValue";
import Validator from "../../../../lib/validator/validator";
import IMix from "../../../../lib/types/structure/iMix";

const sinon = require("sinon");

describe("TestModuleSQLevelMaster", function() {
    let communicatorMock : MockManager<Communicator.default>;
    let commandBuilderMock : MockManager<CommandBuilderSQ.default>;
    let driverMock : MockManager<Driver>
    let driver : Driver;
    let communicator : Communicator.default;
    let commandBuilder: CommandBuilderSQ.default;
    let validator: Validator;
    let levelMaster : ModuleSQLevelMaster;

    const sandbox = sinon.createSandbox();
    beforeEach(function() {
        communicatorMock = ImportMock.mockClass(Communicator);
        commandBuilderMock = ImportMock.mockClass(CommandBuilderSQ);
        driverMock = ImportMock.mockClass(DriverSQ);  
        driver = new DriverSQ.default("111.222.333.444",1234);
        communicator = new Communicator.default(driver);
        commandBuilder = new CommandBuilderSQ.default();
        validator = new Validator({inputs: 12, aux: 6, groups: 4, fx: 7, scenes: 200, softkeys: 14});

        levelMaster = new ModuleSQLevelMaster(commandBuilder, validator);
    });

    afterEach(function() {
        communicatorMock.restore();
        commandBuilderMock.restore();
        driverMock.restore();
    });

    it("setValue", function() {
        let setValueMixStub = sinon.stub(levelMaster, 'setValueMix');
        setValueMixStub.callsFake(function(mix: IMix, value: ValueLevel) {
            expect(mix.mixType, "mixType").to.be.eq("aux");
            expect(mix.mix, "mix").to.be.eq(3);
            expect(value.value, "value").to.be.eq(24);
        });

        let value = new ValueLevel(24);

        levelMaster.setValue(3, value);

        expect(setValueMixStub.calledOnce).to.be.true;
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
        levelMaster.setValueMix("lr", value);

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
        levelMaster.setValueMix({mixType: "aux", mix: 3}, value);

        expect(sendStub.calledOnce, "called commandBuilder").to.be.true;
        expect(writeStub.calledOnceWith(data), "called communicator write").to.be.true;
    });

    it("setValueMix Aux 1", function() {
        let writeStub = communicatorMock.mock("write", "");
        writeStub.callsFake(function(data: string) {});

        let data = new Uint8Array([8,7,6,5]);

        let sendStub = commandBuilderMock.mock("toSendValue", data);
        sendStub.callsFake(function(msb: number, lsb: number, vc: number, vf: number) : Uint8Array {
            expect(msb, "msb").to.be.eq(0x4f);
            expect(lsb, "lsb").to.be.eq(0x01);
            expect(vc, "vc").to.be.eq(0x6d);
            expect(vf, "vf").to.satisfy(function(num: number) { return num >= 0x38 && num <= 0x3A; });
            return data;
        });

        let value = new ValueLevel(-10);

        levelMaster.setCommunicator(communicator);
        levelMaster.setValueMix({mixType: "aux", mix: 1}, value);

        expect(sendStub.calledOnce, "called commandBuilder").to.be.true;
        expect(writeStub.calledOnceWith(data), "called communicator write").to.be.true;
    });

    it("setValueMix throw no communicator", function() {
        let value = new ValueLevel(10);
        let valueMixCall = sinon.spy(levelMaster, "setValueMix");
        try {
            levelMaster.setValueMix({ mixType: "aux", mix: 11 }, value);
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
        requestValueMixStub.callsFake(function(mix: {mixType: "aux" | "groups" | "fx", mix: number}) {
            expect(mix.mixType, "mixType").to.be.eq("aux");
            expect(mix.mix, "mix").to.be.eq(2);
        });

        levelMaster.requestValue(2);

        expect(requestValueMixStub.calledOnce).to.be.true;
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
        levelMaster.requestValueMix({ mixType: "aux", mix: 5 });

        expect(sendStub.calledOnce, "called commandBuilder").to.be.true;
        expect(writeStub.calledOnceWith(data), "called communicator write").to.be.true;
    });

    it("requestValue throw no communicator", function() {
        let value = new ValueLevel(0);
        let reguestCall = sinon.spy(levelMaster, "requestValueMix");
        try {
            levelMaster.requestValueMix({ mixType: "aux", mix: 11 });
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
        incValueMixStub.callsFake(function(mix: {mixType: "group", mix: 1}) {
            expect(mix.mixType, "mixType").to.be.eq("group");
            expect(mix.mix, "mix").to.be.eq(1);
        });

        levelMaster.incValue(7);

        expect(incValueMixStub.calledOnce).to.be.true;
    });

    it("incValueMix", function() {
        let writeStub = communicatorMock.mock("write", "");
        writeStub.callsFake(function(data: string) {});

        let data = new Uint8Array([1,2,3,4]);

        let sendStub = commandBuilderMock.mock("toSendInc", data);
        sendStub.callsFake(function(msb: number, lsb: number) : Uint8Array {
            expect(msb, "msb").to.be.eq(0x4f);
            expect(lsb, "lsb").to.be.eq(0x03);
            return data;
        });

        levelMaster.setCommunicator(communicator);
        levelMaster.incValueMix({ mixType: "aux", mix: 3 });

        expect(sendStub.calledOnce, "called commandBuilder").to.be.true;
        expect(writeStub.calledOnceWith(data), "called communicator write").to.be.true;
    });

    it("decValue", function() {
        let decValueMixStub = sinon.stub(levelMaster, 'decValueMix');
        decValueMixStub.callsFake(function (mix: { mixType: "group", mix: 1 }) {
            expect(mix.mixType, "mixType").to.be.eq("aux");
            expect(mix.mix, "mix").to.be.eq(3);
        });

        levelMaster.decValue(3);

        expect(decValueMixStub.calledOnce).to.be.true;
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
        levelMaster.decValueMix("lr");

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