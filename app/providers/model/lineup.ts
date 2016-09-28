import {Injectable} from "@angular/core";
import {SafeUrl} from '@angular/platform-browser';

import * as Info from "./lineup_info.d";
import {S3File, S3Image} from "../aws/s3file";
import * as Base64 from "../../util/base64";
import {Logger} from "../../util/logging";

const logger = new Logger("Lineup");

const ROOT = "unauthorized";
const LINEUP = "lineup";
const SPEC_VALUE = "spec-value";

@Injectable()
export class Lineup {
    all: Promise<Item[]>;

    constructor(private s3: S3File, private cim: CachedImageMaker) {
        this.all = this.getAll();
    }

    private async getAll(): Promise<Item[]> {
        const rootDir = `${ROOT}/${LINEUP}/`
        const finds = await this.s3.list(rootDir);
        const keys = _.filter(finds.map((path) => {
            if (path.endsWith("/")) {
                const name = path.substring(rootDir.length, path.length - 1);
                const l = _.split(name, "/");
                if (l.length === 1) {
                    return l[0];
                }
            }
            return null;
        }));
        const list = keys.map(async (key) => {
            try {
                return await this.load(key);
            } catch (ex) {
                logger.warn(() => `Failed to load '${key}': ${ex}`);
                return null;
            }
        });
        return _.filter(await Promise.all(list));
    }

    private async load(key: string): Promise<Item> {
        const text = await this.s3.read(`${ROOT}/${LINEUP}/${key}/info.json.encoded`);
        const info = Base64.decodeJson(text) as Info.Lineup;
        return new Item(this.s3, this.cim, key, info);
    }

    async get(key: string): Promise<Item> {
        const lineup = _.find(await this.all, {"key": key});
        return lineup.renew();
    }
}

export class Item {
    specs: ItemSpec[];
    measurements: ItemMeas[];
    private _titleImage: CachedImage;
    private _images: {[key: string]: CachedImage} = {};

    constructor(private s3: S3File, private cim: CachedImageMaker, public _key: string, public info: Info.Lineup) {
        logger.info(() => `${_key}: ${JSON.stringify(info, null, 4)}`);
        this.specs = _.map(info.specs, (spec) => new ItemSpec(cim, this, spec));
        this.measurements = _.map(info.measurements, (m) => new ItemMeas(cim, this, m));
    }

    renew(): Item {
        return new Item(this.s3, this.cim, this.dir, this.info);
    }

    get key(): string {
        return this._key;
    }

    get dir(): string {
        return `${ROOT}/${LINEUP}/${this._key}`
    }

    get name(): string {
        return this.info.name;
    }

    get titleImage(): SafeUrl {
        if (_.isNil(this._titleImage)) {
            this._titleImage = this.cim.create([`${this.dir}title.png`]);
        }
        return this._titleImage.url;
    }

    private refreshImages(): {[key: string]: CachedImage} {
        const names = _.map(this.specs, (spec) => spec.current.dir);
        const dir = `${this.dir}/images/${_.join(names, "/")}/`;
        const first = _.first(_.values(this._images).map((i) => i.pathList[0]));
        if (!first.startsWith(dir)) {
            this._images = {};
            this.s3.list(dir).then((list) => {
                const pngs = _.filter(list, (path) => _.endsWith(path, ".png"));
                const loads = _.map(pngs, (path) => {
                    const side = path.substring(dir.length, path.length - 4);
                    this._images[side] = this.cim.create([path]);
                });
            });
        }
        return this._images;
    }

    getImage(side: Info.SpecSide): SafeUrl {
        return this.refreshImages()[side].url;
    }

    get totalPrice(): number {
        var result = this.info.price;
        _.forEach(this.specs, (spec, key) => {
            const v = spec.current;
            if (v) {
                result = result + v.info.price;
            }
        });
        return result;
    }

    getSpec(key: string): ItemSpec {
        return _.find(this.specs, (s) => _.isEqual(s.info.key, key));
    }
}

export class ItemSpec {
    availables: ItemSpecValue[];
    current: ItemSpecValue;

    constructor(private cim: CachedImageMaker, public item: Item, public info: Info.Spec) {
        this.availables = _.map(info.value.availables, (key) => {
            const v = _.find(item.info.specValues, {"key": key});
            return new ItemSpecValue(cim, this, v);
        });
        this.current = _.find(this.availables, (a) => _.isEqual(a.info.key, info.value.initial));
    }
}

export class ItemSpecValue {
    options: ItemSpecOption[];
    private _image: CachedImage;

    constructor(private cim: CachedImageMaker, public spec: ItemSpec, public info: Info.SpecValue) {
        this.options = _.map(info.options, (o) => new ItemSpecOption(cim, this, o));
    }

    get dir(): string {
        const keys = _.map(this.options, (v) => v.current.info.key);
        return `${this.info.key}/${_.join(keys, "/")}`
    }

    get image(): SafeUrl {
        const list = _.flatMap([ROOT, this.spec.item.dir], (base) =>
            _.map(["svg", "png"], (sux) => `${base}/${SPEC_VALUE}/${this.spec.info.key}/images/${this.dir}/illustration.${sux}`));
        if (_.isNil(this._image) || !this._image.isSamePath(list)) {
            this._image = this.cim.create(list);
        }
        return this._image.url;
    }
}

export class ItemSpecOption {
    availables: ItemSpecOptionValue[];
    current: ItemSpecOptionValue;

    constructor(private cim: CachedImageMaker, public specValue: ItemSpecValue, public info: Info.SpecOption) {
        this.availables = _.map(info.value.availables, (a) => {
            return new ItemSpecOptionValue(cim, this, a);
        });
        this.current = _.find(this.availables, (a) => _.isEqual(a.info.key, info.value.initial));
    }
}

export class ItemSpecOptionValue {
    private _image: CachedImage;

    constructor(private cim: CachedImageMaker, public parent: ItemSpecOption, public info: Info.SpecOptionValue) {
    }

    get image(): SafeUrl {
        const list = _.flatMap([ROOT, this.parent.specValue.spec.item.dir], (base) =>
            _.map(["svg", "png"], (sux) => `${base}/${SPEC_VALUE}/${this.parent.specValue.spec.info.key}/options/${this.parent.specValue.info.key}/${this.info.key}/illustration.${sux}`));
        if (_.isNil(this._image) || !this._image.isSamePath(list)) {
            this._image = this.cim.create(list);
        }
        return this._image.url;
    }
}

export class ItemMeas {
    private _image: CachedImage;
    current: number;

    constructor(private cim: CachedImageMaker, public item: Item, public info: Info.Measurement) {
        this.current = info.value.initial;
    }

    get image(): SafeUrl {
        if (_.isNil(this._image)) {
            const list = _.map(["svg", "png"], (sux) => `${this.item.dir}/measurements/${this.info.key}/illustration.${sux}`);
            this._image = this.cim.create(list);
        }
        return this._image.url;
    }

    get range(): number[] {
        return _.range(this.info.value.min, this.info.value.max + this.info.value.step, this.info.value.step);
    }
}

@Injectable()
class CachedImageMaker {
    constructor(private s3: S3File, private s3image: S3Image) { }

    create(pathList: string[]): CachedImage {
        return new CachedImage(this.s3, this.s3image, pathList);
    }
}

class CachedImage {
    private _url: SafeUrl;

    constructor(private s3: S3File, private s3image: S3Image, public pathList: string[]) { }

    private async load(path: string): Promise<SafeUrl> {
        try {
            if (await this.s3.exists(path)) {
                return await this.s3image.getUrl(path);
            }
        } catch (ex) {
            logger.warn(() => `Failed to load s3image: ${path}: ${ex}`);
        }
        return null;
    }

    private async refresh() {
        var url;
        var i = 0;
        while (_.isNil(url) && i < this.pathList.length) {
            url = await this.load(this.pathList[i++]);
        }
        this._url = url;
    }

    isSamePath(pathList: string[]): boolean {
        return _.isEmpty(_.difference(this.pathList, pathList));
    }

    get url(): SafeUrl {
        this.refresh();
        return this._url;
    }
}
