import { Component, ViewChild } from "@angular/core";
import { NavController, Slides } from "ionic-angular";

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
    static title = "ショップ";
    static icon = "home";

    readonly title = HomePage.title;
    itemGroup: ItemGroup;
    items: Item[];
    slideOptions;
    @ViewChild('slides') slides: Slides;

    topMessages = [
        "カスタムメイド",
        "で作っちゃおう！"
    ];

    constructor(public nav: NavController, lineup: LineupController) {
        ItemGroup.byAll(lineup).then((group) => {
            this.itemGroup = group;
        });
    }

    get isReady(): boolean {
        if (!_.isNil(this.itemGroup) && _.every(this.itemGroup.availables, (item) => !item.titleImage.isLoading) && _.isNil(this.slideOptions)) {
            this.items = _.filter(this.itemGroup.availables, (item) => item.titleImage.url);
            this.slideOptions = {
                loop: _.size(this.items) > 1 ? true : false,
                pager: true,
                autoplay: 3000,
                speed: 700
            };
        }
        return !_.isNil(this.slideOptions);
    }

    choose() {
        const active = this.slides.getActiveIndex();
        const index = (active - 1) % _.size(this.items);
        const item = this.items[index];
        logger.info(() => `Choose ${item.key} at ${index}(${active})`);
        this.nav.push(CustomPage, {
            item: item
        });
    }
}
