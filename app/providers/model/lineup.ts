import {Injectable} from "@angular/core";
import {SafeUrl} from '@angular/platform-browser';

import * as Info from "./lineup_info.d";
import {S3File, S3Image} from "../aws/s3file";
import * as Base64 from "../../util/base64";
import {Logger} from "../../util/logging";

const logger = new Logger("Lineup");

const rootDirName = "lineup"
const rootDir = `unauthorized/${rootDirName}/`;

@Injectable()
export class Lineup {
    all: Promise<Item[]>;

    constructor(private s3: S3File, private s3image: S3Image) {
        this.all = this.getAll();
    }

    private async getAll(): Promise<Item[]> {
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

    private async load(dir: string): Promise<Item> {
        const text = await this.s3.read(`${dir}info.json.encoded`);
        const info = Base64.decodeJson(text) as Info.Lineup;
        return new Item(this.s3, this.s3image, dir, info);
    }

    async get(key: string): Promise<Item> {
        const list = await this.all;
        return _.find(list, {"key": key});
    }
}

export class Item {
    private _key;
    private cachedTitleImage: Promise<SafeUrl>;
    private imageUrls: {[key: string]: SafeUrl} = {};
    private selectedSpecs: {[key: string]: Info.SpecValue} = {};

    constructor(private s3: S3File, private s3image: S3Image, private dir: string, public info: Info.Lineup) {
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
            const v = this.getValue(spec.key);
            return v ? v.key : spec.value.initial;
        });
        const dir = `${this.dir}specImages/${_.join(names, "/")}/`;
        logger.debug(() => `Finding side images: ${dir}`);
        this.s3.list(dir).then((list) => {
            list.forEach(async (path) => {
                if (_.endsWith(path, ".png")) {
                    const side = path.substr(dir.length).replace(/\.png$/, "");
                    logger.debug(() => `Loading side image [${side}]=${path}`);
                    this.imageUrls[side] = await this.s3image.getUrl(path);
                }
            });
        });
    }

    get specKeys(): string[] {
        return _.keys(this.selectedSpecs);
    }

    getSpec(key: string): Info.Spec {
        return _.find(this.info.specs, {"key": key});
    }

    getValue(key: string): Info.SpecValue {
        return this.selectedSpecs[key];
    }

    setValue(key: string, value: Info.SpecValue) {
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
            const v = this.getValue(spec.key);
            if (v) {
                result = result + v.price;
            }
        });
        return result;
    }
}
