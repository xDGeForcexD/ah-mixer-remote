import { expect } from "chai";

import * as fs from "fs";

import AHMixerRemote from "../index";
import * as net from "net";
import IValue from "../lib/types/structure/iValue";
import ModuleSQLevelToMix from "../lib/drivers/sq/modules/levelToMix";
import ValueLevel from "../lib/types/structure/valueLevel";
import Communicator from "../lib/communicator/communicator";
import { Module } from "module";
import { LevelToMix } from "../lib/drivers/sq/driver";
import IMix from "../lib/types/structure/iMix";

const sinon = require("sinon");

describe("TestAHMixerRemote", function() {
    let fakeTimer : any;
    let mixer : AHMixerRemote;
    const sandbox = sinon.createSandbox();

    beforeEach(function() {
        fakeTimer = sinon.useFakeTimers();
        mixer = new AHMixerRemote("sq","111.222.333.444");

    });

    afterEach(function() {

    });

    it("connect", function() {
        let netConnect = sinon.stub(net.Socket.prototype, 'connect').callsFake(function(options: any) {
            expect(options.host).to.be.eq("111.222.333.444");
            expect(options.port).to.be.eq(51325);
        });
        mixer.connect();
        expect(netConnect.calledOnce).to.be.true;

        netConnect.restore();
    });

    it("disconnect", function() {
        let netEnd = sinon.stub(net.Socket.prototype, 'end').callsFake(function() {});
        mixer.connect();
        mixer.disconnect();
        expect(netEnd.calledOnce).to.be.true;

        netEnd.restore();
    });

    it("isConnected true", function() {
        mixer.communictator.client.emit("connect");
        expect(mixer.isConnected()).to.be.true;
    });

    it("isConnected false", function() {
        mixer.communictator.connectedServer = true;
        mixer.communictator.client.emit("close");
        expect(mixer.isConnected()).to.be.false;
    });

    it("set connectionHandler", function() {
        let called = 0;
        mixer.setCallbackConnection((status: boolean) => {
            expect(status, "value").to.be.true;
            called++;
        });
        mixer.communictator.client.emit("connect");
        expect(called, "called").to.be.eq(1);
    });

    it("getError", function() {
        mixer.communictator.client.emit("error", new Error("message"));
        expect(mixer.getError()).to.be.eq("message");
    });

    it("getModules", function() {
        let modules = mixer.getModules();
        let fileCnt = fs.readdirSync("./lib/drivers/sq/modules/");
        expect(modules.size).to.greaterThan(0);
        expect(modules.size).to.be.eq(fileCnt.length);
    });

    it("getModule levelToMix", function() {
        let module = mixer.getModule("levelToMix");
        expect(module).to.be.an.instanceof(LevelToMix);
    });

    it("getModule not found", function() {
        let module = mixer.getModule("test");
        expect(module).to.be.undefined;
    });

    it("driver not found", function() {
        let called = 0;
        try {
            let mixer2 = new AHMixerRemote("hallo", "111.222.333.444");
        } catch(e) {
            called++;
            expect(e.message).to.be.eq("Driver not found");
        }
        expect(called, "called").to.be.eq(1);
    });

    it("integrated test: get level from mix", function() {
        let called = 0;
        let dataSend = new Uint8Array([0xB0,0x63, 0x40, 0xB0, 0x62, 0x04, 0xB0, 0x06, 0x3A, 0xB0, 0x26, 0x37]);

        mixer.setCallbackReceive("levelToMix", function(channel: number, value: IValue) {
            expect(channel, "channel").to.be.eq(5);
            expect(value.value, "value").to.be.eq(-65);
            called++;
        });
        mixer.communictator.client.emit("data", dataSend);
        expect(called, "called").to.be.eq(1);
    });

    it("integrated test: get level from custom mix", function() {
        let called = 0;
        let dataSend = new Uint8Array([0xB0, 0x63, 0x43, 0xB0, 0x62, 0x54, 0xB0, 0x06, 0x79, 0xB0, 0x26, 0x40]);

        let module : ModuleSQLevelToMix = <ModuleSQLevelToMix> mixer.getModules().get("levelToMix");
        module.addCallbackReiceveMix(function(mix: "lr" | IMix, channel: number, value: IValue) {
            expect(mix, "mix").to.be.deep.eq({mixType: "aux", mix: 5});
            expect(channel, "channel").to.be.eq(34);
            expect(value.value, "value").to.be.eq(3);
            called++;
        });

        mixer.communictator.client.emit("data", dataSend);
        expect(called, "called").to.be.eq(1);
    });

    it("integrated test: send level to mix", function() {
        let writeCall = sandbox.stub(Communicator.prototype, "write");
        writeCall.callsFake(function(data: Uint8Array) {
            expect(data[0], "byte1").to.be.eq(0xB0);
            expect(data[1], "byte2").to.be.eq(0x63);
            expect(data[2], "byte3").to.be.eq(0x40);
            expect(data[3], "byte4").to.be.eq(0xB0);
            expect(data[4], "byte5").to.be.eq(0x62);
            expect(data[5], "byte6").to.be.eq(0x29);
            expect(data[6], "byte7").to.be.eq(0xB0);
            expect(data[7], "byte8").to.be.eq(0x06);
            expect(data[8], "byte9").to.be.eq(0x65);
            expect(data[9], "byte10").to.be.eq(0xB0);
            expect(data[10], "byte11").to.be.eq(0x26);
            expect(data[11], "byte12").to.be.eq(0x0c);
            return true;
        });

        let module : ModuleSQLevelToMix = <ModuleSQLevelToMix> mixer.getModules().get("levelToMix");
        module.setValue(42, new ValueLevel(-19));

        expect(writeCall.calledOnce).to.be.true;

        writeCall.restore();
    });

    it("integrated test: request muted channel from mix", function() {
        let writeCall = sandbox.stub(Communicator.prototype, "write");
        writeCall.callsFake(function(data: Uint8Array) {
            expect(data[0], "byte1").to.be.eq(0xB0);
            expect(data[1], "byte2").to.be.eq(0x63);
            expect(data[2], "byte3").to.be.eq(0x00);
            expect(data[3], "byte4").to.be.eq(0xB0);
            expect(data[4], "byte5").to.be.eq(0x62);
            expect(data[5], "byte6").to.be.eq(0x10);
            expect(data[6], "byte7").to.be.eq(0xB0);
            expect(data[7], "byte8").to.be.eq(0x60);
            expect(data[8], "byte9").to.be.eq(0x7f);
            return true;
        });

        let module = mixer.getModules().get("mute");
        if(module !== undefined) {
            module.requestValue(17);
        }

        expect(writeCall.calledOnce).to.be.true;

        writeCall.restore();
    });
    
});