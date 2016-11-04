import _ from "lodash";
import { AppVersion } from "ionic-native";
import Im from "immutable";

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

export class LogLevel {
    static readonly None = new LogLevel(null);
    static readonly DEBUG = new LogLevel("DEBUG");
    static readonly INFO = new LogLevel("INFO");
    static readonly WARN = new LogLevel("WARN");
    static readonly FATAL = new LogLevel("FATAL");

    static readonly all = Im.List.of<LogLevel>(LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.FATAL);
    private static maxLenOfNames = LogLevel.all.map((l) => l.name.length).max();

    private constructor(private _name: string | null) {
    }

    toString(): string {
        return this.name;
    }

    get name(): string {
        return this._name || "None";
    }

    get isNone(): boolean {
        return _.isNil(this._name);
    }

    get mark(): string {
        if (this.isNone) {
            return _.padStart("", LogLevel.maxLenOfNames, "-");
        }
        return _.padStart(this._name, LogLevel.maxLenOfNames);
    }

    get index(): number {
        return LogLevel.all.indexOf(this);
    }
}

export class Logger {
    private static _isDebel: Promise<boolean>;
    private static _level: Promise<LogLevel>;

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

    static async getDefaultLevel(): Promise<LogLevel> {
        if (_.isNil(Logger._level)) {
            async function obtain() {
                return await Logger.isDevel() ? LogLevel.DEBUG : LogLevel.INFO;
            }
            Logger._level = obtain();
        }
        return await Logger._level;
    }

    static async output(text: string) {
        if (!_.isEqual(typeof plugin, "undefined") && !_.isNil(plugin.Fabric)) {
            plugin.Fabric.Crashlytics.log(text);
        }
        if (!_.isEqual(typeof console, "undefined")) {
            console.log(text);
        }
    }

    constructor(private tag: string) {
    }

    private _level: LogLevel;
    get level() {
        return this._level;
    }
    set level(v: LogLevel) {
        this.output(LogLevel.None, () => `Set log level: ${v}`);
        this._level = v;
        this._limit = null;
    }

    private _limit: Promise<number>;
    private async getLimit(): Promise<number> {
        if (_.isNil(this._level)) {
            this._level = await Logger.getDefaultLevel();
            this.output(LogLevel.None, () => `Using default log level: ${this._level}`);
        }
        return this.level.index;
    }
    private get limit(): Promise<number> {
        if (_.isNil(this._limit)) {
            this._limit = this.getLimit();
        }
        return this._limit;
    }

    private async output(level: LogLevel, msg: () => string) {
        if (level.isNone || await this.limit <= level.index) {
            Logger.output(`${dateString()}: ${level.mark}: ${this.tag}: ${msg()}`);
        }
    }

    public debug(msg: () => string) {
        this.output(LogLevel.DEBUG, msg);
    }

    public info(msg: () => string) {
        this.output(LogLevel.INFO, msg);
    }

    public warn(msg: () => string) {
        this.output(LogLevel.WARN, msg);
    }

    public fatal(msg: () => string) {
        this.output(LogLevel.FATAL, msg);
    }
}
