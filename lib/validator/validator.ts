import IMixerDetail from "../types/structure/iMixerDetail";
import IMix from "../types/structure/iMix";

class Validator {

    details : IMixerDetail;

    constructor(mixerDetails: IMixerDetail) {
        this.details = mixerDetails;
    }

    parseNumberToMix(channel: number): "lr" | IMix {
        if(channel < 0) {
            throw new Error("can not parse number to mix"); 
        }

        let offset = 0;
        if(channel === 0) {
            return "lr";
        } 

        if(channel-offset <= this.details.aux) {
            return {mixType: "aux", mix: channel-offset};
        }

        offset += this.details.aux;
        if (channel - offset <= this.details.groups) {
            return { mixType: "group", mix: channel - offset };
        }

        offset += this.details.groups;
        if (channel - offset <= this.details.fx) {
            return { mixType: "fx", mix: channel - offset };
        }
        
        throw new Error("can not parse number to mix");        
    }

    parseMixToNumber(mix: "lr" | IMix): number {
        let offset = 0;
        if (mix === "lr") {
            return 0;
        }

        if (mix.mixType === "aux") {
            return offset + mix.mix;
        }

        offset += this.details.aux;
        if (mix.mixType === "group") {
            return offset + mix.mix;
        }

        offset += this.details.groups;
        return offset + mix.mix;
    }

    checkMixAndInput(mix: "lr" | IMix, channel: number) {
        this.checkMix(mix);
        this.checkInput(channel);
    }

    checkMix(mix: "lr" | IMix) {
        if (mix !== "lr") {
            switch (mix.mixType) {
                case "aux":
                    this.checkAux(mix.mix);
                    break;
                case "group":
                    this.checkGroup(mix.mix);
                    break;
                case "fx":
                    this.checkFX(mix.mix);
                    break;
            }
        }
    }

    checkInput(channel: number) {
        if (channel < 1 || channel > this.details.inputs) {
            throw new Error("wrong channel input");
        }
    }
    checkAux(aux: number) {
        if (aux < 1 || aux > this.details.aux) {
            throw new Error("wrong aux input");
        }
    }
    checkGroup(group: number) {
        if (group < 1 || group > this.details.groups) {
            throw new Error("wrong group input");
        }
    } 
    checkFX(fx: number) {
        if (fx < 1 || fx > this.details.fx) {
            throw new Error("wrong fx input");
        }
    }
    checkSoftkey(softkey: number) {
        if (softkey < 1 || softkey > this.details.softkeys) {
            throw new Error("wrong softkey input");
        }
    }
    checkScene(scene: number) {
        if (scene < 1 || scene > this.details.scenes) {
            throw new Error("wrong scene input");
        }
    } 
}

export default Validator;