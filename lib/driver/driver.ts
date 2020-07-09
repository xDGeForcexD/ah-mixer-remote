import Module from "../module/module";
import CommandBuilder from "../commandBuilder/commandBuilder";

abstract class Driver {
    abstract key : string;
    abstract name: string;
    ip: string;
    abstract port: number;

    abstract commandBuilder : CommandBuilder;
    
    modules : Map<string, Module> = new Map<string, Module>();
    
    constructor(ip: string) {
        this.ip = ip;
    }
}

export default Driver;