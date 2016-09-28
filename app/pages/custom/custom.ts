import {Component,
  trigger,
  state,
  style,
  transition,
  keyframes,
  animate} from "@angular/core";
import {SafeUrl} from '@angular/platform-browser';
import {ViewController, NavParams, ModalController} from "ionic-angular";

import * as Lineup from "../../providers/model/lineup";
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
    item: Lineup.Item;

    sides = ["FRONT", "BACK"];
    side: Info.SpecSide = "FRONT";

    priceMessage = "現在のお値段";
    priceUnit = "￥";

    constructor(params: NavParams, private modal: ModalController, private lineup: Lineup.Lineup) {
        this.title = params.get("name");
        lineup.get(params.get("key")).then((item) => {
            this.item = item;
        });
    }

    get isReady(): boolean {
        return !_.isNil(this.item) && !_.isNil(this.item.getImage(this.side));
    }

    onSide(side: Info.SpecSide): string {
        return _.isEqual(this.side, side) ? stateOn : stateOff;
    }

    turn_over() {
        this.side = _.isEqual(this.side, "FRONT") ? "BACK" : "FRONT";
    }

    private filterSpecs(side: Info.SpecSide): Lineup.ItemSpec[] {
        return _.filter(this.item.specs, (spec) => {
            return _.includes(spec.info.sides, side);
        });
    }

    getSpecs(side: Info.SpecSide): Lineup.ItemSpec[] {
        return this.filterSpecs(side);
    }

    openSpec(spec: Lineup.ItemSpec) {
        logger.debug(() => `Open Spec: ${spec.info.key}`);
        this.modal.create(SpecDialog, { spec: spec }).present();
    }
}

@Component({
    templateUrl: 'build/pages/custom/spec_dialog.html'
})
class SpecDialog {
    spec: Lineup.ItemSpec;
    title: string;

    textChoose = "選択";
    priceUnit = "￥";

    constructor(params: NavParams, private viewCtrl: ViewController) {
        this.spec = params.get("spec");
        this.title = this.spec.info.name;
    }

    close() {
        this.viewCtrl.dismiss();
    }

    choose(v: Lineup.ItemSpecValue) {
        logger.info(() => `Choose spec[${this.spec.info.key}]: ${v.info.key}`);
        this.spec.current = v;
        this.close();
    }
}
