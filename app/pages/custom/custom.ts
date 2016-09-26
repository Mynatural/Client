import {Component,
  trigger,
  state,
  style,
  transition,
  keyframes,
  animate} from "@angular/core";
import {SafeUrl} from '@angular/platform-browser';
import {NavController, NavParams, ModalController} from "ionic-angular";

import {Lineup, Item, ItemSpec} from "../../providers/model/lineup";
import * as Info from "../../providers/model/lineup_info.d";
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
    item: Item;

    isFront = true;

    priceMessage = "現在のお値段";
    priceUnit = "￥";

    constructor(params: NavParams, private modal: ModalController, private lineups: Lineup) {
        this.title = params.get('name');
        lineups.get(params.get('key')).then((item) => {
            this.item = item;
        });
    }

    get isReady(): boolean {
        return !_.isNil(this.item) && !_.isNil(this.item.imageFront)
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

    private filterSpecs(side: Info.SpecSide): Info.Spec[] {
        return _.filter(this.item.info.specs, (spec) => {
            return _.includes(spec.sides, side);
        });
    }

    get specsFront(): Info.Spec[] {
        return this.filterSpecs("FRONT");
    }

    get specsBack(): Info.Spec[] {
        return this.filterSpecs("BACK");
    }

    openSpec(key: string) {
        logger.debug(() => `Open Spec: ${key}`);
        this.modal.create(SpecDialog, { spec: this.item.specs[key] }).present();
    }
}

@Component({
    templateUrl: 'build/pages/custom/spec_dialog.html'
})
class SpecDialog {
    spec: ItemSpec;

    constructor(params: NavParams) {
        this.spec = params["spec"];
    }
}
