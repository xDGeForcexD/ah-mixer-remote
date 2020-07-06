import { expect } from "chai";
import { ImportMock, MockManager } from "ts-mock-imports";
import * as Communicator from "../../../../lib/communicator/communicator";
import * as CommandBuilderSQ from "../../../../lib/drivers/sq/commandBuilder";
import * as DriverSQ from "../../../../lib/drivers/sq/driver";
import Driver from "../../../../lib/driver/driver";
import ModuleSQMute from "../../../../lib/drivers/sq/modules/mute";
import ValueState from "../../../../lib/types/structure/valueState";

const sinon = require("sinon");

describe("TestModuleSQMute", function() {
    let communicatorMock : MockManager<Communicator.default>;
    let commandBuilderMock : MockManager<CommandBuilderSQ.default>;
    let driverMock : MockManager<Driver>
    let driver : Driver;
    let communicator : Communicator.default;
    let commandBuilder : CommandBuilderSQ.default;
    let mute : ModuleSQMute;

    const sandbox = sinon.createSandbox();
    beforeEach(function() {
        communicatorMock = ImportMock.mockClass(Communicator);
        commandBuilderMock = ImportMock.mockClass(CommandBuilderSQ);
        driverMock = ImportMock.mockClass(DriverSQ);  
        driver = new DriverSQ.default("111.222.333.444",1234);
        communicator = new Communicator.default(driver);
        commandBuilder = new CommandBuilderSQ.default();
        mute = new ModuleSQMute(commandBuilder);
    });

    afterEach(function() {
        communicatorMock.restore();
        commandBuilderMock.restore();
        driverMock.restore();
    });

    it("setValue on", function() {
        let writeStub = communicatorMock.mock("write", "");
        writeStub.callsFake(function(data: string) {});

        let data = new Uint8Array([1,2,3,4]);

        let sendStub = commandBuilderMock.mock("toSendValue", data);
        sendStub.callsFake(function(msb: number, lsb: number, vc: number, vf: number) : Uint8Array {
            expect(msb, "msb").to.be.eq(0x00);
            expect(lsb, "lsb").to.be.eq(0x05);
            expect(vc, "vc").to.be.eq(0x00);
            expect(vf, "vf").to.be.eq(0x01);
            return data;
        });

        mute.setCommunicator(communicator);
        mute.setValue(6, new ValueState(true));

        expect(sendStub.calledOnce, "called commandBuilder").to.be.true;
        expect(writeStub.calledOnceWith(data), "called communicator write").to.be.true;
    });

    it("setValue off", function() {
        let writeStub = communicatorMock.mock("write", "");
        writeStub.callsFake(function(data: string) {});

        let data = new Uint8Array([8,9,5,7]);

        let sendStub = commandBuilderMock.mock("toSendValue", data);
        sendStub.callsFake(function(msb: number, lsb: number, vc: number, vf: number) : Uint8Array {
            expect(msb, "msb").to.be.eq(0x00);
            expect(lsb, "lsb").to.be.eq(0x14);
            expect(vc, "vc").to.be.eq(0x00);
            expect(vf, "vf").to.be.eq(0x00);
            return data;
        });

        mute.setCommunicator(communicator);
        mute.setValue(21, new ValueState(false));

        expect(sendStub.calledOnce, "called commandBuilder").to.be.true;
        expect(writeStub.calledOnceWith(data), "called communicator write").to.be.true;
    });

    it("setValue throw no communicator", function() {
        let muteCall = sinon.spy(mute, "setValue");
        try {
            mute.setValue(13, new ValueState(true));
          } catch (e) {
              expect(e.message).to.be.eq("no communicator is set");
          }
        expect(muteCall.threw()).to.be.true;        
    });

    it("setValueMix throw invalid channel", function() {
        mute.setCommunicator(communicator);
        let muteCall = sinon.spy(mute, "setValue");
        try {
            mute.setValue(49, new ValueState(false));
          } catch (e) {
              expect(e.message).to.be.eq("wrong channel input");
          }
        expect(muteCall.threw()).to.be.true;  
    });

    it("requestValue", function() {
        let writeStub = communicatorMock.mock("write", "");
        writeStub.callsFake(function(data: string) {});

        let data = new Uint8Array([1,2,3,4]);

        let sendStub = commandBuilderMock.mock("toGetValue", data);
        sendStub.callsFake(function(msb: number, lsb: number) : Uint8Array {
            expect(msb, "msb").to.be.eq(0x00);
            expect(lsb, "lsb").to.be.eq(0x0a);
            return data;
        });

        mute.setCommunicator(communicator);
        mute.requestValue(11);

        expect(sendStub.calledOnce, "called commandBuilder").to.be.true;
        expect(writeStub.calledOnceWith(data), "called communicator write").to.be.true;
    });

    it("requestValue throw no communicator", function() {
        let reguestCall = sinon.spy(mute, "requestValue");
        try {
            mute.requestValue(54);
          } catch (e) {
              expect(e.message).to.be.eq("no communicator is set");
          }
        expect(reguestCall.threw()).to.be.true;        
    });

    it("requestValue throw invalid channel", function() {
        mute.setCommunicator(communicator);
        let reguestCall = sinon.spy(mute, "requestValue");
        try {
            mute.requestValue(0);
          } catch (e) {
              expect(e.message).to.be.eq("wrong channel input");
          }
        expect(reguestCall.threw()).to.be.true;  
    });

    it("toggleValue", function() {
        let writeStub = communicatorMock.mock("write", "");
        writeStub.callsFake(function(data: string) {});

        let data = new Uint8Array([1,2,3,4]);

        let sendStub = commandBuilderMock.mock("toSendInc", data);
        sendStub.callsFake(function(msb: number, lsb: number) : Uint8Array {
            expect(msb, "msb").to.be.eq(0x00);
            expect(lsb, "lsb").to.be.eq(0x21);
            return data;
        });

        mute.setCommunicator(communicator);
        mute.toggleValue(34);

        expect(sendStub.calledOnce, "called commandBuilder").to.be.true;
        expect(writeStub.calledOnceWith(data), "called communicator write").to.be.true;
    });

    it("callbackReceive", function() {
        commandBuilderMock.mock("isPackageForMe",true);

        let data = new Uint8Array([1,2,3,4]);

        let calls = 0;
        mute.addCallbackReiceve((data: Uint8Array) => {
            expect(data, "receiver1").to.be.eq(data);
            calls++;
        });
        mute.addCallbackReiceve((data: Uint8Array) => {
            expect(data, "receiver2").to.be.eq(data);
            calls++;
        });

        mute.callbackReceive(data);
        expect(calls).to.be.eq(2);
    });
});