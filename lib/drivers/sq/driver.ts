import Driver from "../../driver/driver";
import Module from "../../module/module";

/* MODULE LIST */
/* ADD MODULE INCLUDES HERE */
import Mix from "./modules/mix";
import Mute from "./modules/mute";
import Scenes from "./modules/scenes";
import Softkey from "./modules/softkey";

class DriverSQ extends Driver {
    key = "SQ";
    name = "SQ Mixer";

    port = 1234;

    constructor(ip : string, port? : number) {
        super(ip);
        if(port !== undefined) {
            this.port = port;
        }

        // add specific driver modules
        // add new module if exists
        let modules : Module[] = [];
        modules.push(new Mix());
        modules.push(new Mute());
        modules.push(new Scenes());
        modules.push(new Softkey());

        // formating modules to use easy
        modules.forEach(module => {
            if(module.driverRequiere === this.key) {
                this.modules.set(module.key, module);
            }
        })
    }

}

export default DriverSQ;