import Driver from "./lib/driver/driver";
import DriverList from "./lib/driver/driverList";
import Communicator from "./lib/communicator/communicator";
import ICallbackReceive from "./lib/types/functions/iCallbackReceive";

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
        if(port === undefined) {
            this.driver = new driverClass(ip, null);
        } else {
            this.driver = new driverClass(ip, port);
        }

        // create new communictator instance
        this.communictator = new Communicator(this.driver);

        // add receiver callback from modules
        this.driver.modules.forEach(module => {
            this.communictator.addReceiver(module.callbackReceive);
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

    setCallbackReceive(module: string, callback: ICallbackReceive) : void {
        if(this.driver.modules.has(module)) {
            this.driver.modules.get(module)!.addCallbackReiceve(callback);
        }
    }
}

export default AHMixerRemote;