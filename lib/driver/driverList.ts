import Driver from "./driver";

/* DRIVER LIST */
/* ADD DRIVER INCLUDES HERE */
import DriverSQ from "../drivers/sq/driver";


class DriverList {

    drivers : Map<string, any> = new Map<string, any>();

    constructor() {
        this.drivers.set("sq", DriverSQ);
    }

    getDriver(key: string) : any {
        if(this.drivers.has(key)) {
            return this.drivers.get(key);
        }
        return null;
    }

}

export default DriverList;