import { expect } from "chai";
import { ImportMock, MockManager } from "ts-mock-imports";
import * as fs from "fs";
import * as CommandBuilderSQ from "../../../lib/drivers/sq/commandBuilder";
import DriverSQ from "../../../lib/drivers/sq/driver";

const sinon = require("sinon");

describe("TestDriverSQ", function() {
    let commandBuilderMock : MockManager<CommandBuilderSQ.default>;
    
    beforeEach(function() {
        commandBuilderMock = ImportMock.mockClass(CommandBuilderSQ);
    });

    afterEach(function() {
        commandBuilderMock.restore();
    });

    it("constructor", function() {
        let driver = new DriverSQ("111.222.333.444");
        let fileCnt = fs.readdirSync("./lib/drivers/sq/modules/");
        expect(driver.ip).to.be.eq("111.222.333.444");
        expect(driver.port).to.be.eq(51325);
        expect(driver.modules.size).to.be.eq(fileCnt.length);
    });

    it("constructor port", function() {
        let driver = new DriverSQ("111.222.333.444", 9876);
        expect(driver.port).to.be.eq(9876);
    })
});