import {Injectable} from "@angular/core";
import {SafeUrl} from '@angular/platform-browser';

import {S3File, S3Image} from "../aws/s3file";
import * as Base64 from "../../util/base64";
import {Logger} from "../../util/logging";

const logger = new Logger("Lineup");

const rootDir = "unauthorized/lineup/";

@Injectable()
export class Lineups {
    all: Promise<Lineup[]>;

    constructor(private s3: S3File, private s3image: S3Image) {
        this.all = this.getAll();
    }

    private async getAll(): Promise<Lineup[]> {
        const finds = await this.s3.list(rootDir);
        const dirs = _.filter(finds, (path) => {
            return _.endsWith(path, "/");
        });
        const list = dirs.map(async (dir) => {
            if (dir === rootDir) return null;
            try {
                return await this.load(dir);
            } catch (ex) {
                logger.warn(() => `Failed to load '${dir}': ${ex}`);
                return null;
            }
        });
        return _.filter(await Promise.all(list));
    }

    private async load(dir: string): Promise<Lineup> {
        const text = await this.s3.read(`${dir}info.json.encoded`);
        const info = Base64.decodeJson(text) as LineupInfo;
        return new Lineup(dir, info, this.s3image);
    }

    async get(key: string): Promise<Lineup> {
        const list = await this.all;
        return _.find(list, {"key": key});
    }
}

export class Lineup {
    private _key;
    private cachedTitleImage: Promise<SafeUrl>;

    constructor(private dir: string, private info: LineupInfo, private s3image: S3Image) {
        this._key = _.last(_.filter(_.split(dir, "/")));
        logger.info(() => `${this._key}: ${JSON.stringify(info, null, 4)}`);
    }

    get key(): string {
        return this._key;
    }

    get name(): string {
        return this.info.name;
    }

    get titleImage(): Promise<SafeUrl> {
        if (_.isNil(this.cachedTitleImage)) {
            this.cachedTitleImage = this.s3image.getUrl(`${this.dir}title.png`);
        }
        return this.cachedTitleImage;
    }
}

//// Lineup の info.json の定義

type LineupInfo = {
    name: string,
    price: number,
    specs: Spec[],
    measurements: Measurement[]
}

type Spec = {
    name: string,
    key: string,
    side: string, // "FRONT" or "BACK"
    value: {
        initial: string,
        availables: {
            name: string,
            price: number
        }[]
    }
}

type Measurement = {
    name: string,
    illustration: string, // Filename of SVG
    value: {
        initial: number,
        min: number,
        max: number
    }
}
