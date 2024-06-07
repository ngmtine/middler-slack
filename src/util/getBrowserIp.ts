import { execSync } from "node:child_process";

export const getBrowserIp = () => {
    const command = "ip route | grep 'default via' | grep -Eo '[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}'";
    const stdout = execSync(command);
    return stdout.toString();
};
