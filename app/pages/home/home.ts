import {Component} from "@angular/core";
import {SafeUrl} from '@angular/platform-browser';
import {NavController} from "ionic-angular";

import {FATHENS_DIRECTIVES} from "../../components/all";
import {FATHENS_PROVIDERS} from "../../providers/all";
import {S3Image} from "../../providers/aws/s3file";

const lineup = [
    { key: "short-sleeved", name: "半袖", image: "unauthorized/images/short-sleeved.jpg" },
    { key: "long-sleeved", name: "長袖", image: "unauthorized/images/long-sleeved.jpg" },
    { key: "no-sleeved", name: "袖無し", image: "unauthorized/images/no-sleeved.jpg" },
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
    constructor(public navCtrl: NavController, s3image: S3Image) {
        Promise.all(lineup.map(async (item) => {
            return {
                key: item.key,
                name: item.name,
                image: await s3image.getUrl(item.image)
            };
        })).then((list) => {
            this.items = list;
        });
    }

    items: Array<Item>;
    slideOptions = {
        loop: true,
        pager: true,
        autoplay: 3000,
        speed: 700
    };
}
