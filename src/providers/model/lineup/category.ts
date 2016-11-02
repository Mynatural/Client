import _ from "lodash";
import Im from "immutable";

import Info from "./_info.d";
import { ROOT, LINEUP } from "./lineup";
import { Item } from "./item";
import { S3File } from "../../aws/s3file";
import { Logger } from "../../util/logging";
import * as Base64 from "../../util/base64";

const logger = new Logger("Lineup.Category");

export class Category {
    static async byAll(s3file: S3File): Promise<Im.List<Category>> {
        const path = _.join([ROOT, LINEUP, "categories.json"], "/");
        const text = await s3file.read(path);
        const json = Base64.decodeJson(text) as Info.Categories;
        const array = _.map(json, (v, key) => {
            return new Category(key, v.title, Im.Map(v.flags));
        });
        return Im.List(array);
    }

    constructor(
        public readonly key: string,
        public readonly title: string,
        public readonly flags: Im.Map<string, string>,
        public readonly srcList: Im.List<Item>) {
    }

    private cachedReslut: Item[];

    filter(srcList?: Item[]): Item[] {
        if (!srcList && this.cachedReslut) {
            return this.cachedReslut;
        }

        var result = srcList || this.srcList;
        this.flags.forEach((value, name) => {
            result = _.filter(result, (item) => {
                return _.isEqual(item.flags[name], value);
            });
        });
        logger.debug(() => `Filtered items: ${_.size(srcList)} -> ${_.size(result)}`);

        if (!srcList) {
            this.cachedReslut = result;
        }
        return result;
    }
}
