import _ from "lodash";
import Im from "immutable";

import { Component } from "@angular/core";
import { NavController } from "ionic-angular";

import { CustomPage } from "../custom/custom";
import { S3File } from "../../providers/aws/s3file";
import { LineupController } from "../../providers/model/lineup/lineup";
import { Category } from "../../providers/model/lineup/category";
import { ItemGroup, Item } from "../../providers/model/lineup/item";
import { Logger } from "../../providers/util/logging";

const logger = new Logger("HomePage");

@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {
    static readonly title = "ホーム";
    static readonly icon = "home";

    readonly title = HomePage.title;

    readonly titleCategorySelect = "カテゴリー";
    readonly unselectedCategoryKey = "選択なし";
    readonly priceName = "ベース価格";
    readonly priceUnit = "￥";

    news: Categorized;
    gendered: Categorized[];
    categorized: Categorized;

    categories: { [key: string]: Category };
    categoryKeys: string[];

    private _categoryKey = this.unselectedCategoryKey;
    get categoryKey(): string {
        return this._categoryKey;
    }
    set categoryKey(v: string) {
        if (_.has(this.categories, v)) {
            const c = this.categories[v];
            c.filter().then((items) => {
                this.categorized = {
                    key: v,
                    title: c.title,
                    message: c.message,
                    items: items
                };
            });
        }
        this._categoryKey = v;
    }

    constructor(public nav: NavController, private s3file: S3File, private lineup: LineupController) {
        this.init();
    }

    private async init() {
        const itemGroup = await ItemGroup.byAll(this.lineup);
        const allItems = Im.List(itemGroup.availables);

        this.loadNews(allItems).then(async (v) => {
            const items = await v.filter();
            this.news = {
                key: "news",
                title: v.title,
                message: v.message,
                items: items
            };
        });
        this.loadCategories(allItems).then((v) => {
            this.categories = v;
            this.categoryKeys = _.keys(this.categories);
        });

        const genders = {
            girls: new Category({
                title: "女の子",
                message: "",
                flags: { gender: "girls" }
            }, allItems),
            boys: new Category({
                title: "男の子",
                message: "",
                flags: { gender: "boys" }
            }, allItems)
        };
        this.gendered = await Promise.all(_.map(genders, async (c, key) => {
            const items = await c.filter();
            return {
                key: key,
                title: c.title,
                message: c.message,
                items: items
            };
        }));
    }

    private async loadNews(allItems: Im.List<Item>): Promise<Category> {
        try {
            return await Category.loadNews(this.s3file, allItems);
        } catch (ex) {
            logger.warn(() => `Failed to load News: ${ex}`);
            return new Category({
                title: "新作アイテム",
                message: "",
                flags: { priority: "news" }
            }, allItems);
        }
    }

    private async loadCategories(allItems: Im.List<Item>): Promise<{ [key: string]: Category }> {
        try {
            return (await Category.loadAll(this.s3file, allItems)).toObject();
        } catch (ex) {
            logger.warn(() => `Failed to load Categories: ${ex}`);
            return {};
        }
    }

    choose(item) {
        logger.info(() => `Choose ${item.key}`);
        this.nav.push(CustomPage, {
            item: item
        });
    }
}

export type Categorized = {
    key: string,
    title: string,
    message: string,
    items: Item[]
}
