import _ from "lodash";
import Im from "immutable";

import { Component } from "@angular/core";
import { NavController } from "ionic-angular";

import { CategorizedPage } from "../categorized/categorized";
import { CustomPage } from "../custom/custom";
import { CategoryController, Category } from "../../providers/model/lineup/category";
import { Item } from "../../providers/model/lineup/item";
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

    constructor(public nav: NavController, private ctgCtrl: CategoryController) {
        this.loadNews().then(async (v) => {
            this.news = await Categorized.fromCategory("news", v);
        });
        this.loadCategories().then((v) => {
            this.categories = v.toObject();
            this.categoryKeys = _.keys(this.categories);
        });
        this.loadGenders().then(async (v) => {
            this.gendered = await Categorized.fromCategories(v);
        });
    }

    private async loadNews(): Promise<Category> {
        try {
            return await this.ctgCtrl.loadNews();
        } catch (ex) {
            logger.warn(() => `Failed to load News: ${ex}`);
            return new Category(this.ctgCtrl, {
                title: "新作アイテム",
                message: "",
                flags: { priority: "news" }
            });
        }
    }

    private async loadCategories(): Promise<Im.Map<string, Category>> {
        try {
            return await this.ctgCtrl.loadAll();
        } catch (ex) {
            logger.warn(() => `Failed to load Categories: ${ex}`);
            return Im.Map<string, Category>({});
        }
    }

    private async loadGenders(): Promise<Im.Map<string, Category>> {
        try {
            return await this.ctgCtrl.loadGenders();
        } catch (ex) {
            logger.warn(() => `Failed to load Categories: ${ex}`);
            return this.ctgCtrl.byMap({
                girls: {
                    title: "女の子",
                    message: "",
                    flags: { gender: "girls" }
                },
                boys: {
                    title: "男の子",
                    message: "",
                    flags: { gender: "boys" }
                }
            });
        }
    }

    choose(item: Item) {
        logger.info(() => `Choose ${item.key}`);
        this.nav.push(CustomPage, {
            item: item
        });
    }

    more(categorized: Categorized) {
        logger.info(() => `More categorized: ${categorized.title}`);
        this.nav.push(CategorizedPage, {
            category: categorized.src
        });
    }
}

export class Categorized {
    static async fromCategory(key: string, c: Category, limit?: number): Promise<Categorized> {
        return new Categorized(key, c, limit);
    }
    static async fromCategories(src: Im.Map<string, Category>, limit?: number): Promise<Categorized[]> {
        const list = src.map((c, key) => Categorized.fromCategory(key, c, limit));
        return Promise.all(list.toArray());
    }

    constructor(
        readonly key: string,
        readonly src: Category,
        private _limit: number = 5
    ) { }

    private _items: Item[];

    get hasMore(): boolean {
        return this.src.items && this.src.items.size > this._limit;
    }

    get title(): string {
        return this.src.title;
    }

    get message(): string {
        return this.src.message;
    }

    get items(): Item[] {
        if (_.isNil(this._items)) {
            if (this.src.items) {
                this._items = _.take(this.src.items.toArray(), this._limit);
            }
        }
        return this._items;
    }
}
