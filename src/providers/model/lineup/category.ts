import _ from "lodash";
import Im from "immutable";

import Info from "./_info.d";
import { ROOT, LINEUP } from "./lineup";
import { Item } from "./item";
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

export class Category {
    private static async load(s3file: S3File, key: string): Promise<any> {
        const path = pathJson(key);
        const text = await s3file.read(path);
        return Base64.decodeJson(text);
    }

    private static async loadMap(s3file: S3File, name: string, srcList: Im.List<Item> = Im.List<Item>()): Promise<Im.Map<string, Category>> {
        const json = (await Category.load(s3file, name)) as Info.Categories;
        const map = _.mapValues(json, (v) => new Category(v, srcList));
        return Im.Map(map);
    }

    private static async save(s3file: S3File, key: string, obj: any): Promise<void> {
        const path = pathJson(key);
        const text = Base64.encodeJson(obj);
        await s3file.write(path, text);
    }

    static async loadNews(s3file: S3File, srcList: Im.List<Item> = Im.List<Item>()): Promise<Category> {
        const v = (await Category.load(s3file, newsJson)) as Info.Category;
        return new Category(v, srcList);
    }

    static async loadAll(s3file: S3File, srcList: Im.List<Item> = Im.List<Item>()): Promise<Im.Map<string, Category>> {
        return Category.loadMap(s3file, categoriesJson, srcList);
    }

    static async loadGenders(s3file: S3File, srcList: Im.List<Item> = Im.List<Item>()): Promise<Im.Map<string, Category>> {
        return Category.loadMap(s3file, gendersJson, srcList);
    }

    static async saveNews(s3file: S3File, obj: Info.Category): Promise<void> {
        await Category.save(s3file, newsJson, obj);
    }

    static async saveAll(s3file: S3File, obj: Info.Categories): Promise<void> {
        await Category.save(s3file, categoriesJson, obj);
    }

    static async saveGenders(s3file: S3File, obj: Info.Categories): Promise<void> {
        await Category.save(s3file, gendersJson, obj);
    }

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

    private cachedReslut: Im.List<Item>;

    async filter(srcList?: Item[]): Promise<Item[]> {
        if (!srcList && this.cachedReslut) {
            return this.cachedReslut.toArray();
        }

        srcList = srcList || this.srcList.toArray();
        var result = srcList;
        this.flags.forEach((value, name) => {
            result = _.filter(result, (item) => {
                return _.isEqual(item.flags[name], value);
            });
        });
        logger.debug(() => `Filtered items: ${_.size(srcList)} -> ${_.size(result)}`);

        if (!srcList) {
            this.cachedReslut = Im.List(result);
        }
        return result;
    }
}
