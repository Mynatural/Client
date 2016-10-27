import { AppVersion } from "ionic-native";

declare const plugin: any;

function dateString(now?: Date): string {
    if (!now) now = new Date();
    const pad = (d: number) => (v: number) => _.padStart(v.toString(), d, "0");
    const date = [
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    ].map(pad(2)).join("-");
    const time = [
        now.getHours(),
        now.getMinutes(),
        now.getSeconds()
    ].map(pad(2)).join(":");
    return `${date} ${time}.${pad(3)(now.getMilliseconds())}`;
}

export type Level = "DEBUG" | "INFO" | "WARN" | "FATAL";

const levels: Array<Level> = ["DEBUG", "INFO", "WARN", "FATAL"];
const maxLenOfLevels = _.max(_.map(levels, (l) => l.length));

function indexLevel(level: Level): number {
    return _.indexOf(levels, level);
}

export class Logger {
    private static _isDebel: Promise<boolean>;
    private static _level: Promise<Level>;

    static async isDevel(): Promise<boolean> {
        if (_.isNil(Logger._isDebel)) {
            async function obtain() {
                try {
                    const version: string = await AppVersion.getVersionNumber();
                    const last = _.last(version.match(/[0-9]/g));
                    return _.toInteger(last) % 2 !== 0;
                } catch (ex) {
                    return true;
                }
            }
            Logger._isDebel = obtain();
        }
        return await Logger._isDebel;
    }

    static async getDefaultLevel(): Promise<Level> {
        if (_.isNil(Logger._level)) {
            async function obtain() {
                return await Logger.isDevel() ? "DEBUG" : "INFO";
            }
            Logger._level = obtain();
        }
        return await Logger._level;
    }

    static async output(text: string) {
        if (!_.isEqual(typeof plugin, "undefined") && !_.isNil(plugin.Fabric)) {
            plugin.Fabric.Crashlytics.log(text);
            if (await Logger.isDevel()) {
                console.log(text);
            }
        } else {
            console.log(text);
        }
    }

    constructor(private tag: string) {
    }

    private _level: Level;
    get level() {
        return this._level;
    }
    set level(v: Level) {
        this.output(null, () => `Set log level: ${v}`);
        this._level = v;
        this._limit = null;
    }

    private _limit: Promise<number>;
    private async getLimit(): Promise<number> {
        if (_.isNil(this._level)) {
            this._level = await Logger.getDefaultLevel();
            this.output(null, () => `Using default log level: ${this._level}`);
        }
        return indexLevel(this.level);
    }
    private get limit(): Promise<number> {
        if (_.isNil(this._limit)) {
            this._limit = this.getLimit();
        }
        return this._limit;
    }

    private async output(level: Level, msg: () => string) {
        if (_.isNil(level) || await this.limit <= indexLevel(level)) {
            const lm = _.isNil(level) ?
                    _.padStart("", maxLenOfLevels, "-") :
                    _.padStart(level, maxLenOfLevels);
            Logger.output(`${dateString()}: ${lm}: ${this.tag}: ${msg()}`);
        }
    }

    public debug(msg: () => string) {
        this.output("DEBUG", msg);
    }

    public info(msg: () => string) {
        this.output("INFO", msg);
    }

    public warn(msg: () => string) {
        this.output("WARN", msg);
    }

    public fatal(msg: () => string) {
        this.output("FATAL", msg);
    }
}
