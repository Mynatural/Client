import {Component} from "@angular/core";
import {SafeUrl} from '@angular/platform-browser';
import {NavController, NavParams} from "ionic-angular";

import {Lineups, Lineup} from "../../providers/model/lineup";
import {Logger} from "../../util/logging";

const logger = new Logger("CustomPage");

@Component({
    templateUrl: 'build/pages/custom/custom.html'
})
export class CustomPage {
    title: string;
    itemKey: string;
    item: Lineup;

    onFront: boolean = true;

    priceMessage = "現在のお値段";
    priceUnit = "￥";
    price = 1234;

    constructor(private params: NavParams, private lineups: Lineups) {
        this.itemKey = params.get('key');
        this.title = params.get('name');
        lineups.get(this.itemKey).then((item) => {
            this.item = item;
        });
    }

    get isReady(): boolean {
        return this.item != null;
    }

    turn_over() {
        logger.debug(() => `TurnOver`);
    }

    specs = [
        {
            class: "bold",
            name: "胴まわり",
            value: "70cm"
        },
        {
            class: "sleeve",
            name: "そでの長さ",
            value: "20cm"
        }
    ];
}
