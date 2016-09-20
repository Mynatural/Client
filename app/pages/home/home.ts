import {Component} from "@angular/core";
import {SafeUrl} from '@angular/platform-browser';
import {NavController} from "ionic-angular";

import {CustomPage} from "../custom/custom";
import {S3Image} from "../../providers/aws/s3file";
import {Logger} from "../../util/logging";

const logger = new Logger("HomePage");

const lineup = [
    { key: "short-sleeved", name: "はんそで" },
    { key: "long-sleeved", name: "ながそで" },
    { key: "no-sleeved", name: "そでなし" },
    { key: "jinbei", name: "じんべい" },
];

type Item = {
    key: string,
    name: string,
    image: SafeUrl
};

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

    constructor(public nav: NavController, s3image: S3Image) {
        Promise.all(lineup.map(async (item) => {
            return {
                key: item.key,
                name: item.name,
                image: await s3image.getUrl(`unauthorized/images/lineup/${item.key}.jpg`)
            };
        })).then((list) => {
            this.items = list;
        });
    }

    get isReady(): boolean {
        return !_.isNil(this.items);
    }

    items: Array<Item>;
    slideOptions = {
        loop: true,
        pager: true,
        autoplay: 3000,
        speed: 700
    };

    choose(item: Item) {
        logger.info(() => `Choose ${item.key}`);
        this.nav.push(CustomPage, item);
    }
}
