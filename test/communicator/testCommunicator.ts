import { expect } from "chai";
import { ImportMock, MockManager } from "ts-mock-imports";

import * as net from "net";
import * as DriverSQ from "../../lib/drivers/sq/driver";
import Communicator from "../../lib/communicator/communicator";
import Driver from "../../lib/driver/driver";

const sinon = require("sinon");

describe("TestCommunicator", function() {
    let fakeTimer : any;
    let driver : Driver;
    let driverMock : MockManager<Driver>
    let communicator : Communicator;
    const sandbox = sinon.createSandbox();

    beforeEach('mock dependecies', function () {
        fakeTimer = sinon.useFakeTimers();
        driverMock = ImportMock.mockClass(DriverSQ);  
        driver = new DriverSQ.default("111.222.333.444",1234);
        driver.ip = "111.222.333.444";
        driver.port = 1234;
        communicator = new Communicator(driver);
    });

    afterEach('restore dependencies', function () {
        driverMock.restore();
        fakeTimer.restore();
        sandbox.restore();
    });

    it("connect", function() {
        let called = false;

        sinon.stub(net.Socket.prototype, 'connect').callsFake(function(options: any) {
            expect(options.host).to.be.eq("111.222.333.444");
            expect(options.port).to.be.eq(1234);
            called = true;
        });
        
        communicator.connect();
        expect(communicator.enable).to.be.true;
        expect(called).to.be.true;      
                
    });

    it("connection ok", function() {
        communicator.client.emit("connect");
        expect(communicator.isConnected()).to.be.true;
    });

    it("connection end", function() {
        communicator.connectedServer = true;
        communicator.client.emit("close");
        expect(communicator.isConnected()).to.be.false;
    });

    it("connection error", function() {
        communicator.connectedServer = true;
        communicator.client.emit("error");
        expect(communicator.isConnected()).to.be.false;
    });

    it("disconnect", function() {
        let endCall = sandbox.spy(net.Socket.prototype, "end");
        communicator.connectedServer = true;
        communicator.enable = true;
        communicator.disconnect();
        expect(communicator.enable, "enable").to.be.false;
        expect(endCall.calledOnce, "end command send").to.be.true;
    });

    it("connection reconnect", function() {
        let connectCall = sandbox.spy(communicator, "startConnection");
        communicator.enable = true;
        communicator.client.emit("error");
        expect(connectCall.calledOnce, "reconnect before wait time").to.be.false;
        fakeTimer.tick(1000);
        expect(connectCall.calledOnce, "reconnect after wait time").to.be.true;

    });

    it("send message one", function() {
        let writeCall = sandbox.spy(net.Socket.prototype, "write");
        communicator.connectedServer = true;
        communicator.write("testdata");
        expect(writeCall.calledOnceWith("testdata")).to.be.true;
    });

    it("send message two", function() {
        let writeCall = sandbox.spy(net.Socket.prototype, "write");
        communicator.connectedServer = true;
        communicator.write("testdata");
        communicator.write("testdata2");
        expect(writeCall.calledOnceWith("testdata"), "send message one").to.be.true;
        fakeTimer.tick(100);
        expect(writeCall.calledWith("testdata2"), "send message two").to.be.true;
        expect(writeCall.calledTwice, "only two message was send").to.be.true;
    });

    it("receive message", function() {
        let called = 0;
        communicator.addReceiver((data) => {
            called++;
            expect(data).to.be.eq("testreceive");
        });
        communicator.client.emit("data", "testreceive");
        expect(called).to.be.eq(1);
    });
});