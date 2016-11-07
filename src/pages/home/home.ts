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
    readonly readMore = "MORE ...";

    news: Categorized;
    gendered: Categorized[];
    categorized: Categorized;

    categories: { [key: string]: Category };
    categoryKeys: string[];

    private _categoryKey = this.unselectedCategoryKey;
    get categoryKey(): string {
        return this._categoryKey;
    }
    set categoryKey(key: string) {
        this._categoryKey = key;
        if (_.has(this.categories, key)) {
            Categorized.fromCategory(key, this.categories[key]).then((v) => {
                this.categorized = v;
            });
        } else {
            this.categorized = null;
        }
    }

    constructor(public nav: NavController, private s3file: S3File, lineup: LineupController) {
        ItemGroup.byAll(lineup).then((itemGroup) => {
            const allItems = Im.List(itemGroup.availables);

            this.loadNews(allItems).then(async (v) => {
                this.news = await Categorized.fromCategory("news", v);
            });
            this.loadCategories(allItems).then((v) => {
                this.categories = v.toObject();
                this.categoryKeys = _.keys(this.categories);
            });
            this.loadGenders(allItems).then(async (v) => {
                this.gendered = await Categorized.fromCategories(v);
            });
        });
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

    private async loadCategories(allItems: Im.List<Item>): Promise<Im.Map<string, Category>> {
        try {
            return await Category.loadAll(this.s3file, allItems);
        } catch (ex) {
            logger.warn(() => `Failed to load Categories: ${ex}`);
            return Im.Map<string, Category>({});
        }
    }

    private async loadGenders(allItems: Im.List<Item>): Promise<Im.Map<string, Category>> {
        try {
            return await Category.loadGenders(this.s3file, allItems);
        } catch (ex) {
            logger.warn(() => `Failed to load Categories: ${ex}`);
            return Im.Map({
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
            });
        }
    }

    choose(item) {
        logger.info(() => `Choose ${item.key}`);
        this.nav.push(CustomPage, {
            item: item
        });
    }
}

export class Categorized {
    static async fromCategory(key: string, c: Category, limit = 5): Promise<Categorized> {
        return new Categorized(key, c.title, c.message, await c.filter(), limit);
    }
    static async fromCategories(src: Im.Map<string, Category>, limit = 5): Promise<Categorized[]> {
        const list = src.map((c, key) => Categorized.fromCategory(key, c, limit));
        return Promise.all(list.toArray());
    }

    constructor(
        readonly key: string,
        readonly title: string,
        readonly message: string,
        private _items: Item[],
        private _limit: number = 5
    ) {
        this.items = _.take(_items, _limit);
    }

    items: Item[];

    get hasMore(): boolean {
        return _.size(this._items) > this._limit;
    }
}
