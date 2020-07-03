import Module from "../module/module";

abstract class Driver {
    abstract key : string;
    abstract name: string;
    ip: string;
    abstract port: number;
    
    modules : Map<string, Module> = new Map<string, Module>();
    
    constructor(ip: string) {
        this.ip = ip;
    }
}

export default Driver;