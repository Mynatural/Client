import _ from "lodash";
import Im from "immutable";

import { Injectable } from "@angular/core";

import Info from "./_info.d";
import { ROOT, LINEUP, LineupController } from "./lineup";
import { ItemGroup, Item } from "./item";
import { S3File } from "../../aws/s3file";
import { Logger } from "../../util/logging";
import * as Base64 from "../../util/base64";

const logger = new Logger("Lineup.Category");

const newsJson = "news.json";
const categoriesJson = "categories.json";
const gendersJson = "genders.json";

function pathJson(key: string): string {
    return _.join([ROOT, LINEUP, key], "/");
}

@Injectable()
export class CategoryController {
    constructor(private s3file: S3File, private lineup: LineupController) { }

    private _srcList: Promise<Im.List<Item>>;

    get srcList(): Promise<Im.List<Item>> {
        if (_.isNil(this._srcList)) {
            this._srcList = ItemGroup.byAll(this.lineup).then((g) => Im.List(g.availables));
        }
        return this._srcList;
    }

    private async load(key: string): Promise<any> {
        const path = pathJson(key);
        const text = await this.s3file.read(path);
        return Base64.decodeJson(text);
    }

    private async loadMap(key: string): Promise<Im.Map<string, Category>> {
        const json = (await this.load(key)) as Info.Categories;
        const srcList = await this.srcList;
        const map = _.mapValues(json, (v) => new Category(v, srcList));
        return Im.Map(map);
    }

    private async save(key: string, obj: any): Promise<void> {
        const path = pathJson(key);
        const text = Base64.encodeJson(obj);
        await this.s3file.write(path, text);
    }

    async loadNews(): Promise<Category> {
        const v = (await this.load(newsJson)) as Info.Category;
        return new Category(v, await this.srcList);
    }

    async loadAll(): Promise<Im.Map<string, Category>> {
        return this.loadMap(categoriesJson);
    }

    async loadGenders(): Promise<Im.Map<string, Category>> {
        return this.loadMap(gendersJson);
    }

    async saveNews(obj: Info.Category): Promise<void> {
        await this.save(newsJson, obj);
    }

    async saveAll(obj: Info.Categories): Promise<void> {
        await this.save(categoriesJson, obj);
    }

    async saveGenders(obj: Info.Categories): Promise<void> {
        await this.save(gendersJson, obj);
    }
}

export class Category {
    constructor(private json: Info.Category, public readonly srcList: Im.List<Item> = Im.List<Item>()) {
        this._flags = Im.Map(json.flags);
    }

    asJSON(): Info.Category {
        return {
            title: this.title,
            message: this.message,
            flags: this.flags.toObject()
        }
    }

    private _flags: Im.Map<string, string>;

    get title(): string {
        return this.json.title;
    }
    get message(): string {
        return this.json.message;
    }
    get flags(): Im.Map<string, string> {
        return this._flags;
    }

    private _filtering: Promise<Im.List<Item>>;
    private _items: Im.List<Item>;

    get items(): Im.List<Item> {
        if (_.isNil(this._filtering)) {
            this._filtering = this.filter();
            this._filtering.then((v) => {
                this._items = v;
            });
        }
        return this._items;
    }

    private async filter(): Promise<Im.List<Item>> {
        var result = this.srcList;
        this.flags.forEach((value, name) => {
            result = result.filter((item) => {
                return _.isEqual(item.flags[name], value);
            }).toList();
        });
        logger.debug(() => `Filtered items: ${this.srcList.size} -> ${result.size}`);
        return result;
    }


}
