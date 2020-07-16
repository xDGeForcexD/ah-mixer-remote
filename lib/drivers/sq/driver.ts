import Driver from "../../driver/driver";
import Module from "../../module/module";
import CommandBuilderSQ from "./commandBuilder";

/* MODULE LIST */
/* ADD MODULE INCLUDES HERE */
import LevelToMix from "./modules/levelToMix";
import Mute from "./modules/mute";
import Scenes from "./modules/scenes";
import Softkey from "./modules/softkey";

class DriverSQ extends Driver {
    key = "sq";
    name = "SQ Mixer";

    port = 51325;

    commandBuilder : CommandBuilderSQ;

    constructor(ip : string, port? : number) {
        super(ip);
        if(port !== undefined) {
            this.port = port;
        }

        this.commandBuilder = new CommandBuilderSQ();

        // add specific driver modules
        // add new module if exists
        let modules : Module[] = [];
        modules.push(new LevelToMix(this.commandBuilder));
        modules.push(new Mute(this.commandBuilder));
        modules.push(new Scenes(this.commandBuilder));
        modules.push(new Softkey(this.commandBuilder));

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
    Mute,
    Scenes,
    Softkey
};
