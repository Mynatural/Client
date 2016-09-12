import {Component} from "@angular/core";
import {NavController} from "ionic-angular";

import {FATHENS_DIRECTIVES} from "../../components/all";
import {FATHENS_PROVIDERS} from "../../providers/all";

@Component({
    templateUrl: 'build/pages/home/home.html',
    directives: [FATHENS_DIRECTIVES],
    providers: [FATHENS_PROVIDERS]
})
export class HomePage {
    constructor(public navCtrl: NavController) { }

    items: Array<Item> = [
        { key: "short-sleeved", name: "半袖", image: "unauthorized/images/short-sleeved.jpg" },
        { key: "long-sleeved", name: "長袖", image: "unauthorized/images/long-sleeved.jpg" },
        { key: "no-sleeved", name: "袖無し", image: "unauthorized/images/no-sleeved.jpg" },
    ];
    slideOptions = {
        loop: true,
        pager: true,
        autoplay: 3000,
        speed: 700
    };
}

type Item = {
    key: string,
    name: string,
    image: string
};
