import { Component } from "@angular/core";
import { NavController } from "ionic-angular";

import { CustomPage } from "../custom/custom";
import { LineupController } from "../../providers/model/lineup/lineup";
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
    itemGroup: ItemGroup;
    items: Item[];
    news: Item[];
    girls: Item[];
    boys: Item[];

    topMessages = [
        "冬の新作ラインナップ"
    ];

    constructor(public nav: NavController, lineup: LineupController) {
        ItemGroup.byAll(lineup).then((group) => {
            this.itemGroup = group;
        });
    }

    get isReady(): boolean {
        if (_.isNil(this.items) && !_.isNil(this.itemGroup) && _.every(this.itemGroup.availables, (item) => !item.titleImage.isLoading)) {
            this.items = _.filter(this.itemGroup.availables, (item) => item.titleImage.url);

            this.news = this.filter("news", undefined);
            this.girls = this.filter("gender", undefined);
            this.boys = this.filter("gender", undefined);
        }
        return !_.isNil(this.items);
    }

    private filter(flagName: string, flagValue: string): Item[] {
        return _.filter(this.items, (item) => {
            const value = item.flags[flagName];
            return _.isEqual(value, flagValue);
        });
    }

    choose(item) {
        logger.info(() => `Choose ${item.key}`);
        this.nav.push(CustomPage, {
            item: item
        });
    }
}
