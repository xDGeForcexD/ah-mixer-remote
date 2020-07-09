import Driver from "./lib/driver/driver";
import DriverList from "./lib/driver/driverList";
import Communicator from "./lib/communicator/communicator";
import Module from "./lib/module/module";
import ICallbackValue from "./lib/types/functions/iCallbackValue";
import Mixes from "./lib/types/enums/mixes";

class AHMixerRemote {
    driver : Driver;
    communictator : Communicator;

    constructor(driver: string, ip: string, port? : number) {
        // check if driver exists and create new instance
        let driverList : DriverList = new DriverList();
        let driverClass : any = driverList.getDriver(driver);
        if(driverClass === null) {
            throw new Error("Driver not found");
        }
        this.driver = new driverClass(ip, port);

        // create new communictator instance
        this.communictator = new Communicator(this.driver);

        // add receiver callback from modules
        this.driver.modules.forEach(module => {
            module.setCommunicator(this.communictator);
            this.communictator.addReceiver(module.callbackReceive.bind(module));
        });
    }

    connect() : void {
        this.communictator.connect();
    }

    disconnect() : void {
        this.communictator.disconnect();
    }

    isConnected() : Boolean {
        return this.communictator.isConnected();
    }

    getModules() : Map<string, Module> {
        return this.driver.modules;
    }

    setCallbackReceive(module: string, callback: ICallbackValue) : void {
        if(this.driver.modules.has(module)) {
            this.driver.modules.get(module)!.addCallbackReiceve(callback);
        }
    }
}

export default AHMixerRemote;