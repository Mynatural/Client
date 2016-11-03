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
    genders: Category[];
    categories: Category[];

    titleCategorySelect = "カテゴリー";
    selectedCategory: Category;

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

    private async categorize(items: Item[]) {
        const allItems = Im.List(items);

        const news = new Promise(async (resolve, reject) => {
            try {
                this.news = await Category.news(this.s3file, allItems);
                resolve();
            } catch (ex) {
                logger.warn(() => `Failed to load News: ${ex}`);
                reject(ex);
            }
        });
        const cates = new Promise(async (resolve, reject) => {
            try {
                this.categories = (await Category.byAll(this.s3file, allItems)).toArray();
                resolve();
            } catch (ex) {
                this.categories = [];
                resolve();
            }
        });

        this.genders = [
            new Category("girls", allItems, {
                title: "女の子",
                message: "",
                flags: { gender: "girls" }
            }),
            new Category("boys", allItems, {
                title: "男の子",
                message: "",
                flags: { gender: "boys" }
            })
        ];

        await Promise.all([news, cates]);
    }

    choose(item) {
        logger.info(() => `Choose ${item.key}`);
        this.nav.push(CustomPage, {
            item: item
        });
    }
}
