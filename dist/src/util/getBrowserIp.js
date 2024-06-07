"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrowserIp = void 0;
const child_process_1 = require("child_process");
const getBrowserIp = () => {
    const command = "ip route | grep 'default via' | grep -Eo '[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}'";
    const stdout = (0, child_process_1.execSync)(command);
    return stdout.toString();
};
exports.getBrowserIp = getBrowserIp;
