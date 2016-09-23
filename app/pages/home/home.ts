import {Component} from "@angular/core";
import {SafeUrl} from '@angular/platform-browser';
import {NavController} from "ionic-angular";

import {CustomPage} from "../custom/custom";
import {Lineups, Lineup} from "../../providers/model/lineup";
import {Logger} from "../../util/logging";

const logger = new Logger("HomePage");

@Component({
    templateUrl: 'build/pages/home/home.html'
})
export class HomePage {
    static title = "ショップ";
    static icon = "home";
    title = HomePage.title;

    topMessages = [
        "カスタムメイド",
        "で作っちゃおう！"
    ];

    constructor(public nav: NavController, private lineups: Lineups) {
        lineups.all.then((list) => {
            Promise.all(list.map(async (lineup) => {
                return {
                    key: lineup.key,
                    name: lineup.name,
                    imageUrl: await lineup.titleImage
                }
            })).then((v) => {
                this.items = v;
            })
        });
    }

    get isReady(): boolean {
        return !_.isNil(this.items);
    }

    items: Array<{
        key: string,
        name: string,
        imageUrl: SafeUrl
    }>;
    slideOptions = {
        loop: true,
        pager: true,
        autoplay: 3000,
        speed: 700
    };

    choose(item: Lineup) {
        logger.info(() => `Choose ${item.key}`);
        this.nav.push(CustomPage, {
            key: item.key,
            name: item.name
        });
    }
}
