import Driver from "../../driver/driver";
import Module from "../../module/module";
import CommandBuilderSQ from "./commandBuilder";

/* MODULE LIST */
/* ADD MODULE INCLUDES HERE */
import LevelToMix from "./modules/levelToMix";
import LevelMaster from "./modules/levelMaster";
import Mute from "./modules/mute";
import Scenes from "./modules/scenes";
import Softkey from "./modules/softkey";
import Validator from "../../validator/validator";

class DriverSQ extends Driver {
    key = "sq";
    name = "SQ Mixer";

    port = 51325;

    details = { inputs: 48, fx: 4, aux: 12, groups: 12, softkeys: 16, scenes: 300};

    commandBuilder : CommandBuilderSQ;
    validator: Validator;

    constructor(ip : string, port? : number) {
        super(ip);
        if(port !== undefined) {
            this.port = port;
        }

        this.commandBuilder = new CommandBuilderSQ();
        this.validator = new Validator(this.details);

        // add specific driver modules
        // add new module if exists
        let modules : Module[] = [];
        modules.push(new LevelToMix(this.commandBuilder, this.validator));
        modules.push(new LevelMaster(this.commandBuilder, this.validator));
        modules.push(new Mute(this.commandBuilder, this.validator));
        modules.push(new Scenes(this.commandBuilder, this.validator));
        modules.push(new Softkey(this.commandBuilder, this.validator));

        // formating modules to use easy
        modules.forEach(module => {
            if(module.driverRequiere === this.key) {
                this.modules.set(module.key, module);
            }
        });
    }

}

export default DriverSQ;
// ADD HERE ALL AVAILABLE MODULES!
export {
    LevelToMix,
    LevelMaster,
    Mute,
    Scenes,
    Softkey
};
