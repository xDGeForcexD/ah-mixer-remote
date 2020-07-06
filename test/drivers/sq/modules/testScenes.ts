import { expect } from "chai";
import { ImportMock, MockManager } from "ts-mock-imports";
import * as Communicator from "../../../../lib/communicator/communicator";
import * as CommandBuilderSQ from "../../../../lib/drivers/sq/commandBuilder";
import * as DriverSQ from "../../../../lib/drivers/sq/driver";
import ModuleSQScenes from "../../../../lib/drivers/sq/modules/scenes";
import Driver from "../../../../lib/driver/driver";
import ValueState from "../../../../lib/types/structure/valueState";

const sinon = require("sinon");

describe("TestModuleSQScenes", function() {
    let communicatorMock : MockManager<Communicator.default>;
    let commandBuilderMock : MockManager<CommandBuilderSQ.default>;
    let driverMock : MockManager<Driver>
    let driver : Driver;
    let communicator : Communicator.default;
    let commandBuilder : CommandBuilderSQ.default;
    let scene : ModuleSQScenes;

    const sandbox = sinon.createSandbox();
    beforeEach(function() {
        communicatorMock = ImportMock.mockClass(Communicator);
        commandBuilderMock = ImportMock.mockClass(CommandBuilderSQ);
        driverMock = ImportMock.mockClass(DriverSQ);  
        driver = new DriverSQ.default("111.222.333.444",1234);
        communicator = new Communicator.default(driver);
        commandBuilder = new CommandBuilderSQ.default();
        commandBuilder.midiChannel = 2;
        scene = new ModuleSQScenes(commandBuilder);
    });

    afterEach(function() {
        communicatorMock.restore();
        commandBuilderMock.restore();
        driverMock.restore();
    });

    it("setValue with true value", function() {
        let setSceneStub = sinon.stub(scene, 'setScene');
        setSceneStub.callsFake(function() {});

        let value = new ValueState(true);

        scene.setValue(3, value);

        expect(setSceneStub.calledOnceWith(3)).to.be.true;
    });

    it("setValue with false value", function() {
        let setSceneStub = sinon.stub(scene, 'setScene');
        setSceneStub.callsFake(function() {});

        let value = new ValueState(false);

        scene.setValue(5, value);

        expect(setSceneStub.notCalled).to.be.true;
    });

    it("setScene scene 96", function() {
        let writeStub = communicatorMock.mock("write", "");
        writeStub.callsFake(function(data: Uint8Array) {
            expect(data[0], "byte1").to.be.eq(0xb2);
            expect(data[1], "byte2").to.be.eq(0x00);
            expect(data[2], "byte3").to.be.eq(0x00);
            expect(data[3], "byte4").to.be.eq(0xc0);
            expect(data[4], "byte5").to.be.eq(0x5f);
        });

        scene.setCommunicator(communicator);
        scene.setScene(96);

        expect(writeStub.calledOnce, "called communicator write").to.be.true;
    });

    it("setScene scene 264", function() {
        let writeStub = communicatorMock.mock("write", "");
        writeStub.callsFake(function(data: Uint8Array) {
            expect(data[0], "byte1").to.be.eq(0xb2);
            expect(data[1], "byte2").to.be.eq(0x00);
            expect(data[2], "byte3").to.be.eq(0x02);
            expect(data[3], "byte4").to.be.eq(0xc0);
            expect(data[4], "byte5").to.be.eq(0x07);
        });

        scene.setCommunicator(communicator);
        scene.setScene(264);

        expect(writeStub.calledOnce, "called communicator write").to.be.true;
    });

    it("setScene throw no communicator", function() {
        let reguestCall = sinon.spy(scene, "setScene");
        try {
            scene.setScene(3);
          } catch (e) {
              expect(e.message).to.be.eq("no communicator is set");
          }
        expect(reguestCall.threw()).to.be.true;        
    });

    it("setScene throw invalid scene", function() {
        scene.setCommunicator(communicator);
        let reguestCall = sinon.spy(scene, "setScene");
        try {
            scene.setScene(301);
          } catch (e) {
              expect(e.message).to.be.eq("wrong scene input");
          }
        expect(reguestCall.threw()).to.be.true;  
    });
});