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
    static title = "ホーム";
    static icon = "home";

    readonly title = HomePage.title;
    private itemGroup: ItemGroup;
    private _isReady = false;

    news: Category;

    categories: { [key: string]: Category };
    categoryKeys: string[];

    genders: { [key: string]: Category };
    genderKeys: string[];

    titleCategorySelect = "カテゴリー";
    readonly unselectedCategoryKey = "選択なし";
    _selectedCategoryKey: string = null;
    get selectedCategoryKey(): string {
        return this._selectedCategoryKey;
    }
    set selectedCategoryKey(v: string) {
        if (!_.has(this.categories, v)) {
            v = null;
        }
        logger.debug(() => `Setting selectedCategoryKey: ${v}`);
        this._selectedCategoryKey = v;
    }

    priceName = "ベース価格";
    priceUnit = "￥";

    constructor(public nav: NavController, private s3file: S3File, lineup: LineupController) {
        ItemGroup.byAll(lineup).then((group) => {
            this.itemGroup = group;
        });
    }

    get isReady(): boolean {
        if (!this._isReady && !_.isNil(this.itemGroup)) {
            if (_.every(this.itemGroup.availables, (item) => !item.titleImage.isLoading)) {
                this.categorize(_.filter(this.itemGroup.availables, (item) => item.titleImage.url));
                this._isReady = true;
            }
        }
        return this._isReady;
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

    private async categorize(items: Item[]) {
        const allItems = Im.List(items);

        const news = new Promise(async (resolve, reject) => {
            this.news = await this.loadNews(allItems);
            resolve();
        });
        const cates = new Promise(async (resolve, reject) => {
            this.categories = await this.loadCategories(allItems);
            this.categoryKeys = _.keys(this.categories);
            resolve();
        });

        this.genders = {
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
        this.genderKeys = _.keys(this.genders);

        await Promise.all([news, cates]);
    }

    choose(item) {
        logger.info(() => `Choose ${item.key}`);
        this.nav.push(CustomPage, {
            item: item
        });
    }
}
