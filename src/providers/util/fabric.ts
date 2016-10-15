import { Logger } from "./logging";

const logger = new Logger("withFabric");

declare const plugin: any;

export function withFabric(proc: (f: any) => any): void {
    try {
        if (typeof plugin !== "undefined" && plugin.Fabric) {
            proc(plugin.Fabric);
        }
    } catch (ex) {
        logger.warn(() => `Error on Fabric: ${ex}`);
    }
}
