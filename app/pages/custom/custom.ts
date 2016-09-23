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
const turnMotion = "0.5s 0s ease";

@Component({
    templateUrl: 'build/pages/custom/custom.html',
    animations: [
        trigger("turnOver", [
            state(stateOn, style({display: "flex"})),
            state(stateOff, style({display: "none"})),
            transition(`${stateOn} => ${stateOff}`, [
                animate(turnMotion, keyframes([
                    style({transform: "rotateY(0)"}),
                    style({transform: "rotateY(90deg)"}),
                    style({transform: "rotateY(90deg)"})
                ]))
            ]),
            transition(`${stateOff} => ${stateOn}`, [
                animate(turnMotion, keyframes([
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
    item: Lineup;

    imageFront: SafeUrl;
    imageBack: SafeUrl;

    isFront = true;

    priceMessage = "現在のお値段";
    priceUnit = "￥";
    price = 1234;

    constructor(private params: NavParams, private lineups: Lineups) {
        this.title = params.get('name');
        lineups.get(params.get('key')).then((item) => {
            this.item = item;
            item.titleImage.then((url) => {
                this.imageFront = url;
                this.imageBack = url;
            })
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
