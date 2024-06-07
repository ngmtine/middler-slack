"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBrowserIp = void 0;
const node_child_process_1 = require("node:child_process");
const getBrowserIp = () => {
    const command = "ip route | grep 'default via' | grep -Eo '[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}'";
    const stdout = (0, node_child_process_1.execSync)(command);
    return stdout.toString();
};
exports.getBrowserIp = getBrowserIp;
