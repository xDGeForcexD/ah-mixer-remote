import { expect } from "chai";

import Validator from "../../lib/validator/validator";
import IMix from "../../lib/types/structure/iMix";

const sinon = require("sinon");

describe("TestValidator", function () {
    let validator: Validator;

    beforeEach(function () {
        validator = new Validator({inputs: 10, aux: 2, groups: 5, fx: 4, softkeys: 8, scenes: 300});
    });

    afterEach(function () {

    });

    it("checkInput", function () {
        const checkCall = sinon.spy(validator, "checkInput");
        try {
            validator.checkInput(3);
        } catch (e) {
        }
        expect(checkCall.threw(), "throw error").to.be.false;
    });
    it("checkInput wrong", function () {
        const checkCall = sinon.spy(validator, "checkInput");
        try {
            validator.checkInput(11);
        } catch(e) {
            expect(e.message, "message").to.be.eq("wrong channel input");
        }
        expect(checkCall.threw(), "throw error").to.be.true;     
    });

    it("checkAux", function () {
        const checkCall = sinon.spy(validator, "checkAux");
        try {
            validator.checkAux(1);
        } catch (e) {
        }
        expect(checkCall.threw(), "throw error").to.be.false;
    });
    it("checkAux wrong", function () {
        const checkCall = sinon.spy(validator, "checkAux");
        try {
            validator.checkAux(3);
        } catch (e) {
            expect(e.message, "message").to.be.eq("wrong aux input");
        }
        expect(checkCall.threw(), "throw error").to.be.true;
    });

    it("checkGroup", function () {
        const checkCall = sinon.spy(validator, "checkGroup");
        try {
            validator.checkGroup(5);
        } catch (e) {
        }
        expect(checkCall.threw(), "throw error").to.be.false;
    });
    it("checkGroup wrong", function () {
        const checkCall = sinon.spy(validator, "checkGroup");
        try {
            validator.checkGroup(0);
        } catch (e) {
            expect(e.message, "message").to.be.eq("wrong group input");
        }
        expect(checkCall.threw(), "throw error").to.be.true;
    });

    it("checkFX", function () {
        const checkCall = sinon.spy(validator, "checkFX");
        try {
            validator.checkFX(2);
        } catch (e) {
        }
        expect(checkCall.threw(), "throw error").to.be.false;
    });
    it("checkFX wrong", function () {
        const checkCall = sinon.spy(validator, "checkFX");
        try {
            validator.checkFX(-5);
        } catch (e) {
            expect(e.message, "message").to.be.eq("wrong fx input");
        }
        expect(checkCall.threw(), "throw error").to.be.true;
    });

    it("checkSoftkey", function () {
        const checkCall = sinon.spy(validator, "checkSoftkey");
        try {
            validator.checkSoftkey(2);
        } catch (e) {
        }
        expect(checkCall.threw(), "throw error").to.be.false;
    });
    it("checkSoftkey wrong", function () {
        const checkCall = sinon.spy(validator, "checkSoftkey");
        try {
            validator.checkSoftkey(-5);
        } catch (e) {
            expect(e.message, "message").to.be.eq("wrong softkey input");
        }
        expect(checkCall.threw(), "throw error").to.be.true;
    });

    it("checkScene", function () {
        const checkCall = sinon.spy(validator, "checkScene");
        try {
            validator.checkScene(2);
        } catch (e) {
        }
        expect(checkCall.threw(), "throw error").to.be.false;
    });
    it("checkScene wrong", function () {
        const checkCall = sinon.spy(validator, "checkScene");
        try {
            validator.checkScene(-5);
        } catch (e) {
            expect(e.message, "message").to.be.eq("wrong scene input");
        }
        expect(checkCall.threw(), "throw error").to.be.true;
    });

    it("checkMix", function () {
        const checkCallAux = sinon.stub(validator, "checkAux");
        const checkCallGroup = sinon.stub(validator, "checkGroup");
        const checkCallFX = sinon.stub(validator, "checkFX");

        validator.checkMix({mixType: "aux", mix: 3});
        expect(checkCallAux.calledOnceWith(3), "aux called once").to.be.true;

        validator.checkMix({ mixType: "group", mix: 8 });
        expect(checkCallGroup.calledOnceWith(8), "aux called once").to.be.true;

        validator.checkMix({ mixType: "fx", mix: 1 });
        expect(checkCallFX.calledOnceWith(1), "fx called once").to.be.true;

        validator.checkMix("lr");

        expect(checkCallAux.calledOnce, "aux called once").to.be.true;
        expect(checkCallGroup.calledOnce, "aux called once").to.be.true;
        expect(checkCallFX.calledOnce, "fx called once").to.be.true;
    });

    it("checkMixAndInput", function () {
        const checkCallInput = sinon.stub(validator, "checkInput");
        const checkCallMix = sinon.stub(validator, "checkMix");

        const mix : IMix = {mixType: "aux", mix: 3};

        validator.checkMixAndInput(mix, 5);
        expect(checkCallInput.calledOnceWith(5), "input called once").to.be.true;
        expect(checkCallMix.calledOnceWith(mix), "aux called once").to.be.true;
    });

    it("parseNumberToMix LR", function () {
        let mix = validator.parseNumberToMix(0);
        expect(mix).to.be.eq("lr");
    });
    it("parseNumberToMix Aux", function () {
        let mix = <IMix>validator.parseNumberToMix(1);
        expect(mix.mixType, "mixType").to.be.eq("aux");
        expect(mix.mix, "mix").to.be.eq(1);

        mix = <IMix>validator.parseNumberToMix(2);
        expect(mix.mixType, "mixType").to.be.eq("aux");
        expect(mix.mix, "mix").to.be.eq(2);
    });
    it("parseNumberToMix Group", function () {
        let mix = <IMix>validator.parseNumberToMix(7);
        expect(mix.mixType, "mixType").to.be.eq("group");
        expect(mix.mix, "mix").to.be.eq(5);
        
        mix = <IMix>validator.parseNumberToMix(3);
        expect(mix.mixType, "mixType").to.be.eq("group");
        expect(mix.mix, "mix").to.be.eq(1);
    });
    it("parseNumberToMix FX", function () {
        let mix = <IMix>validator.parseNumberToMix(8);
        expect(mix.mixType, "mixType").to.be.eq("fx");
        expect(mix.mix, "mix").to.be.eq(1);
        
        mix = <IMix>validator.parseNumberToMix(11);
        expect(mix.mixType, "mixType").to.be.eq("fx");
        expect(mix.mix, "mix").to.be.eq(4);
    });

    it("parseMixToNumber LR", function () {
        let mix = validator.parseMixToNumber("lr");
        expect(mix).to.be.eq(0);
    });
    it("parseMixToNumber Aux", function () {
        let mix = validator.parseMixToNumber({mixType: "aux", mix: 1});
        expect(mix).to.be.eq(1);
        mix = validator.parseMixToNumber({ mixType: "aux", mix: 2 });
        expect(mix).to.be.eq(2);
    });
    it("parseMixToNumber Group", function () {
        let mix = validator.parseMixToNumber({ mixType: "group", mix: 1 });
        expect(mix).to.be.eq(3);
        mix = validator.parseMixToNumber({ mixType: "group", mix: 5 });
        expect(mix).to.be.eq(7);
    });
    it("parseMixToNumber FX", function () {
        let mix = validator.parseMixToNumber({ mixType: "fx", mix: 1 });
        expect(mix).to.be.eq(8);
        mix = validator.parseMixToNumber({ mixType: "fx", mix: 4 });
        expect(mix).to.be.eq(11);
    });
});