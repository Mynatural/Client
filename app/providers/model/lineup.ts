import {Injectable} from "@angular/core";
import {SafeUrl} from '@angular/platform-browser';

import {S3File, S3Image} from "../aws/s3file";
import * as Base64 from "../../util/base64";
import {Logger} from "../../util/logging";

const logger = new Logger("Lineup");

const rootDirName = "lineup"
const rootDir = `unauthorized/${rootDirName}/`;

@Injectable()
export class Lineups {
    all: Promise<Lineup[]>;

    constructor(private s3: S3File, private s3image: S3Image) {
        this.all = this.getAll();
    }

    private async getAll(): Promise<Lineup[]> {
        const finds = await this.s3.list(rootDir);
        const dirs = _.filter(finds, (path) => {
            const ps = path.split("/").reverse();
            return ps[0] == "" && ps[2] == rootDirName;
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
        return new Lineup(this.s3, this.s3image, dir, info);
    }

    async get(key: string): Promise<Lineup> {
        const list = await this.all;
        return _.find(list, {"key": key});
    }
}

export class Lineup {
    private _key;
    private cachedTitleImage: Promise<SafeUrl>;
    private imageUrls: {[key: string]: SafeUrl} = {};
    private selectedSpecs: {[key: string]: SpecValue} = {};

    constructor(private s3: S3File, private s3image: S3Image, private dir: string, public info: LineupInfo) {
        this._key = _.last(_.filter(_.split(dir, "/")));
        logger.info(() => `${this._key}: ${JSON.stringify(info, null, 4)}`);
        info.specs.forEach((spec) => {
            this.selectedSpecs[spec.key] = _.find(spec.value.availables, {"key": spec.value.initial});
        });
        this.refreshImages();
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

    private refreshImages() {
        const names = this.info.specs.map((spec) => {
            const v = this.getSpec(spec.key);
            return v ? v.key : spec.value.initial;
        });
        const dir = `${this.dir}specImages/${_.join(names, "/")}/`;
        this.s3.list(dir).then((list) => {
            list.forEach(async (path) => {
                if (_.endsWith(path, ".png")) {
                    const side = path.substr(dir.length).replace(/\.png$/, "");
                    this.imageUrls[side] = await this.s3image.getUrl(path);
                }
            });
        });
    }

    getSpec(key: string): SpecValue {
        return this.selectedSpecs[key];
    }

    setSpec(key: string, value: SpecValue) {
        this.selectedSpecs[key] = value;
        this.refreshImages();
    }

    get imageFront(): SafeUrl {
        return this.imageUrls["FRONT"];
    }

    get imageBack(): SafeUrl {
        return this.imageUrls["BACK"];
    }

    get totalPrice(): number {
        var result = this.info.price;
        this.info.specs.forEach((spec) => {
            const v = this.getSpec(spec.key);
            if (v) {
                result = result + v.price;
            }
        });
        return result;
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
    side: SpecSide[],
    value: {
        initial: string,
        availables: SpecValue[]
    }
}

type SpecSide = "FRONT" | "BACK";

type SpecValue = {
    name: string,
    key: string,
    price: number
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
