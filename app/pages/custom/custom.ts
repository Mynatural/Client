import {Component,
  trigger,
  state,
  style,
  transition,
  keyframes,
  animate} from "@angular/core";
import {SafeUrl} from '@angular/platform-browser';
import {NavController, NavParams} from "ionic-angular";

import {Lineups, Lineup} from "../../providers/model/lineup";
import {Logger} from "../../util/logging";

const logger = new Logger("CustomPage");

const stateOn = "active";
const stateOff = "inactive";

@Component({
    templateUrl: 'build/pages/custom/custom.html',
    animations: [
        trigger("turnOver", [
            state(stateOn, style({display: "flex"})),
            state(stateOff, style({display: "none"})),
            transition(`${stateOn} => ${stateOff}`, [
                animate("0.5s 0s linear", keyframes([
                    style({transform: "rotateY(0)"}),
                    style({transform: "rotateY(90deg)"}),
                    style({transform: "rotateY(90deg)"})
                ]))
            ]),
            transition(`${stateOff} => ${stateOn}`, [
                animate("0.5s 0s linear", keyframes([
                    style({transform: "rotateY(-90deg)"}),
                    style({transform: "rotateY(-90deg)"}),
                    style({transform: "rotateY(0)"})
                ]))
            ])
        ])
    ]
})
export class CustomPage {
    title: string;
    itemKey: string;
    item: Lineup;

    isFront = true;

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

    get onFront(): string {
        return this.isFront ? stateOn : stateOff;
    }

    get onBack(): string {
        return !this.isFront ? stateOn : stateOff;
    }

    turn_over() {
        this.isFront = !this.isFront;
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
