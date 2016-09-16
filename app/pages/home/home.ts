import {Component} from "@angular/core";
import {SafeUrl} from '@angular/platform-browser';
import {NavController} from "ionic-angular";

import {FATHENS_DIRECTIVES} from "../../components/all";
import {FATHENS_PROVIDERS} from "../../providers/all";
import {S3Image} from "../../providers/aws/s3file";

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
    templateUrl: 'build/pages/home/home.html',
    directives: [FATHENS_DIRECTIVES],
    providers: [FATHENS_PROVIDERS]
})
export class HomePage {
    static title = "ショップ";
    static icon = "home";
    title = HomePage.title;

    topMessages = [
        "カスタムメイド",
        "ラインナップ"
    ];

    constructor(public navCtrl: NavController, s3image: S3Image) {
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
}
