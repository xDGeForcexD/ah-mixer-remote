import { expect} from "chai";
import * as fs from "fs";

import AHMixerRemote from "../index";
import * as net from "net";
import IValue from "../lib/types/structure/iValue";
import ModuleSQLevelToMix from "../lib/drivers/sq/modules/levelToMix";
import ValueLevel from "../lib/types/structure/valueLevel";


describe("TestAHMixerRemote with Server", function() {
    let mixer : AHMixerRemote;
    let server : any;

    afterEach(function() {
        server.close();
    });

    beforeEach(function() {
        server = net.createServer(function(c) {
            c.on('end', function() {
            });
        });
        server.listen(51325, function() {
        });
        mixer = new AHMixerRemote("sq","127.0.0.1");
    });

    it("connect", function(done) {
        this.timeout(5000); 
        let called = 0;

        server.on('connection', function(socket: net.Socket) {
            expect(mixer.isConnected()).to.be.true;
            called++;
            mixer.disconnect();
        });

        setTimeout(function() {
            mixer.connect();
            setTimeout(function() {
                expect(called).to.be.eq(1);
                done();
            },100);
        },100);
        
    });


    it("disconnect", function(done) {
        this.timeout(5000); 
        let called = 0;
        let calledEnd = 0;

        server.on('connection', function(socket: net.Socket) {
            expect(mixer.isConnected()).to.be.true;
            called++;
            socket.on('close', function() {
                calledEnd++;
            });
        });

        setTimeout(function() {
            mixer.connect();
            setTimeout(function() {
                expect(called).to.be.eq(1);
                mixer.disconnect();
                setTimeout(function() {
                    expect(mixer.isConnected()).to.be.false;
                    expect(calledEnd).to.be.eq(1);
                    done();
                },100);
            },100);
        },100);
        
    });

    it("reconnect", function(done) {
        this.timeout(20000); 
        let called = 0;

        server.on('connection', function(socket: net.Socket) {
            expect(mixer.isConnected()).to.be.true;
            called++;
            if(called == 1) {
                socket.destroy();
                server.close();
            }
        });

        setTimeout(function() {
            mixer.connect();
            setTimeout(function() {
                expect(called).to.be.eq(1);
                setTimeout(function() {
                    expect(mixer.isConnected()).to.be.false;
                    server.listen(51325);
                    setTimeout(function() {
                        expect(called).to.be.eq(2);
                        mixer.disconnect();
                        done();
                    }, 5000);
                }, 100);
            },100);
        },100);
        
    });

    it("get level from mix", function(done) {
        this.timeout(5000); 
        let called = 0;
        let calledReceive = 0;

        let dataSend = new Uint8Array([0xB0,0x63, 0x40, 0xB0, 0x62, 0x04, 0xB0, 0x06, 0x3A, 0xB0, 0x26, 0x37]);

        server.on('connection', function(socket: net.Socket) {
            socket.write(dataSend);
            expect(mixer.isConnected()).to.be.true;
            mixer.disconnect();
            called++;
        });

        mixer.setCallbackReceive("levelToMix", function(channel: number, value: IValue) {
            expect(channel, "channel").to.be.eq(5);
            expect(value.value, "value").to.be.eq(-65);
            calledReceive++;
        });
        
        setTimeout(function() {
            mixer.connect();
            setTimeout(function() {
                expect(called).to.be.eq(1);
                setTimeout(function() {
                    expect(calledReceive).to.be.eq(1);
                    done();
                },100);
            },100);
        },100);
    });

    it("send level to mix", function(done) {
        this.timeout(5000); 
        let called = 0;
        let calledReceive = 0;


        server.on('connection', function(socket: net.Socket) {
            expect(mixer.isConnected()).to.be.true;
            socket.on("data", function(data: Uint8Array) {
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
                calledReceive++;
                mixer.disconnect();
            });
            called++;
        });

        let module : ModuleSQLevelToMix = <ModuleSQLevelToMix> mixer.getModules().get("levelToMix");
        
        setTimeout(function() {
            mixer.connect();
            setTimeout(function() {
                expect(called).to.be.eq(1);
                module.setValue(42, new ValueLevel(-19));
                setTimeout(function() {
                    expect(calledReceive).to.be.eq(1);
                    done();
                },100);
            },100);
        },100);
    });
});