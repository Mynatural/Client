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
    specs: ItemSpec[];
    private _key;
    private cachedTitleImage: Promise<SafeUrl>;
    private imageUrlsAwait: {[key: string]: {path: string, url: Promise<SafeUrl>}} = {};
    private imageUrls: {[key: string]: SafeUrl} = {};

    constructor(private s3: S3File, private s3image: S3Image, private dir: string, public info: Info.Lineup) {
        this._key = _.last(_.filter(_.split(dir, "/")));
        logger.info(() => `${this._key}: ${JSON.stringify(info, null, 4)}`);
        this.specs = _.map(info.specs, (spec) => new ItemSpec(s3image, this, spec));
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

    private getImage(side: string): SafeUrl {
        const names = _.map(this.specs, (spec) => spec.current);
        const path = `${this.dir}images/${_.join(names, "/")}/${side}.png`;
        const c = this.imageUrlsAwait[side];
        if (_.isNil(c) || !_.isEqual(c.path, path)) {
            logger.debug(() => `Loading side image [${side}]=${path}`);
            const p = this.s3image.getUrl(path);
            this.imageUrlsAwait[side] = {
                path: path,
                url: p
            };
            p.then((url) => {
                this.imageUrls[side] = url;
            });
        }
        return this.imageUrls[side];
    }

    get imageFront(): SafeUrl {
        return this.getImage["FRONT"];
    }

    get imageBack(): SafeUrl {
        return this.getImage["BACK"];
    }

    get totalPrice(): number {
        var result = this.info.price;
        _.forEach(this.specs, (spec, key) => {
            const v = spec.currentValue;
            if (v) {
                result = result + v.price;
            }
        });
        return result;
    }
}

export class ItemSpec {
    private images: {[key: string]: SafeUrl} = {};
    current: string;

    constructor(private s3image: S3Image, public item: Item, public info: Info.Spec) {
        info.value.availables.forEach(async (a) => {
            const path = `${rootDir}${item.key}/specs/${info.key}/${a.key}.png`;
            const url = await this.s3image.getUrl(path);
            this.images[a.key] = url;
        });
        this.current = info.value.initial;
    }

    getImage(key: string): SafeUrl {
        return this.images[key];
    }

    getValue(key: string): Info.SpecValue {
        return _.find(this.info.value.availables, {"key": key});
    }

    get currentValue(): Info.SpecValue {
        return this.getValue(this.current);
    }
}
