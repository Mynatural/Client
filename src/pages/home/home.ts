import { Component } from "@angular/core";
import { SafeUrl } from '@angular/platform-browser';
import { NavController } from "ionic-angular";

import { CustomPage } from "../custom/custom";
import * as Lineup from "../../providers/model/lineup";
import { Logger } from "../../util/logging";

const logger = new Logger("HomePage");

@Component({
    templateUrl: 'home.html'
})
export class HomePage {
    static title = "ショップ";
    static icon = "home";
    title = HomePage.title;
    items: Lineup.Item[];

    slideOptions = {
        loop: true,
        pager: true,
        autoplay: 3000,
        speed: 700
    };

    topMessages = [
        "カスタムメイド",
        "で作っちゃおう！"
    ];

    constructor(public nav: NavController, private lineups: Lineup.Lineup) {
        lineups.all.then((list) => {
            this.items = list;
        });
    }

    get isReady(): boolean {
        return !_.isNil(this.items);
    }

    choose(item: Lineup.Item) {
        logger.info(() => `Choose ${item.key}`);
        this.nav.push(CustomPage, {
            key: item.key,
            name: item.name
        });
    }
}
