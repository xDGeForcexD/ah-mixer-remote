import Module from "../module/module";
import CommandBuilder from "../commandBuilder/commandBuilder";
import IMixerDetail from "../types/structure/iMixerDetail";

abstract class Driver {
    abstract key : string;
    abstract name: string;
    ip: string;
    abstract port: number;

    abstract details : IMixerDetail;

    abstract commandBuilder : CommandBuilder;
    
    modules : Map<string, Module> = new Map<string, Module>();
    
    constructor(ip: string) {
        this.ip = ip;
    }
}

export default Driver;