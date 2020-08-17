import { expect } from "chai";
import { ImportMock, MockManager } from "ts-mock-imports";
import * as Communicator from "../../../../lib/communicator/communicator";
import * as CommandBuilderSQ from "../../../../lib/drivers/sq/commandBuilder";
import * as DriverSQ from "../../../../lib/drivers/sq/driver";
import ModuleSQSoftkey from "../../../../lib/drivers/sq/modules/softkey";
import Driver from "../../../../lib/driver/driver";
import ValueState from "../../../../lib/types/structure/valueState";
import Validator from "../../../../lib/validator/validator";

const sinon = require("sinon");

describe("TestModuleSQSoftkey", function() {
    let communicatorMock : MockManager<Communicator.default>;
    let commandBuilderMock : MockManager<CommandBuilderSQ.default>;
    let driverMock : MockManager<Driver>
    let driver : Driver;
    let communicator : Communicator.default;
    let commandBuilder: CommandBuilderSQ.default;
    let validator: Validator;
    let softkey : ModuleSQSoftkey;

    const sandbox = sinon.createSandbox();
    beforeEach(function() {
        communicatorMock = ImportMock.mockClass(Communicator);
        commandBuilderMock = ImportMock.mockClass(CommandBuilderSQ);
        driverMock = ImportMock.mockClass(DriverSQ);  
        driver = new DriverSQ.default("111.222.333.444",1234);
        communicator = new Communicator.default(driver);
        commandBuilder = new CommandBuilderSQ.default();
        commandBuilder.midiChannel = 1;
        validator = new Validator({ inputs: 12, aux: 6, groups: 4, fx: 7, scenes: 300, softkeys: 14 });
        softkey = new ModuleSQSoftkey(commandBuilder, validator);
    });

    afterEach(function() {
        communicatorMock.restore();
        commandBuilderMock.restore();
        driverMock.restore();
    });

    it("setValue with true", function() {
        let writeStub = communicatorMock.mock("write", "");
        writeStub.callsFake(function(data: Uint8Array) {
            expect(data[0], "byte1").to.be.eq(0x91);
            expect(data[1], "byte2").to.be.eq(0x32);
            expect(data[2], "byte3").to.be.eq(0x7f);
        });

        let value = new ValueState(true);

        softkey.setCommunicator(communicator);
        softkey.setValue(3, value);

        expect(writeStub.calledOnce, "called communicator write").to.be.true;
    });

    it("setValue with false", function() {
        let writeStub = communicatorMock.mock("write", "");
        writeStub.callsFake(function(data: Uint8Array) {
            expect(data[0], "byte1").to.be.eq(0x81);
            expect(data[1], "byte2").to.be.eq(0x32);
            expect(data[2], "byte3").to.be.eq(0x00);
        });

        let value = new ValueState(false);

        softkey.setCommunicator(communicator);
        softkey.setValue(3, value);

        expect(writeStub.calledOnce, "called communicator write").to.be.true;
    });

    it("setValue throw no communicator", function() {
        let reguestCall = sinon.spy(softkey, "setValue");
        try {
            softkey.setValue(3, new ValueState(true));
          } catch (e) {
              expect(e.message).to.be.eq("no communicator is set");
          }
        expect(reguestCall.threw()).to.be.true;        
    });

    it("setValue throw invalid softkey", function() {
        softkey.setCommunicator(communicator);
        let reguestCall = sinon.spy(softkey, "setValue");
        try {
            softkey.setValue(0, new ValueState(false));
          } catch (e) {
              expect(e.message).to.be.eq("wrong softkey input");
          }
        expect(reguestCall.threw()).to.be.true;  
    });
});