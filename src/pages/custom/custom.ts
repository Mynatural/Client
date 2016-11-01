import _ from "lodash";
import { Component,
        trigger,
        state,
        style,
        transition,
        keyframes,
        animate } from "@angular/core";
import { NavParams, ModalController } from "ionic-angular";

import { SpecDialog } from "./spec_dialog";
import { SPEC_SIDES } from "../../providers/model/lineup/lineup";
import { Item } from "../../providers/model/lineup/item";
import { SpecGroup } from "../../providers/model/lineup/spec";
import * as Info from "../../providers/model/lineup/_info.d";
import { Logger } from "../../providers/util/logging";

const logger = new Logger("CustomPage");

@Component({
    selector: 'page-custom',
    templateUrl: 'custom.html',
    animations: [
        trigger("turnOver", [
            state("active", style({display: "flex"})),
            state("inactive", style({display: "none"})),
            transition("active => inactive", [
                animate("0.5s 0s ease", keyframes([
                    style({transform: "rotateY(0)"}),
                    style({transform: "rotateY(90deg)"}),
                    style({transform: "rotateY(90deg)"})
                ]))
            ]),
            transition("inactive => active", [
                animate("0.5s 0s ease", keyframes([
                    style({transform: "rotateY(-90deg)"}),
                    style({transform: "rotateY(-90deg)"}),
                    style({transform: "rotateY(0)"})
                ]))
            ])
        ])
    ]
})
export class CustomPage {
    item: Item;

    sides = SPEC_SIDES.toArray();
    side: Info.SpecSide = "FRONT";

    priceMessage = "現在のお値段";
    priceUnit = "￥";

    constructor(params: NavParams, private modal: ModalController) {
        this.item = params.get("item");
    }

    get title(): string {
        return this.item.name;
    }

    get isReady(): boolean {
        return !_.isNil(this.item) && !_.isNil(this.item.getImage(this.side));
    }

    onSide(side: Info.SpecSide): string {
        return _.isEqual(this.side, side) ? "active" : "inactive";
    }

    turn_over() {
        this.side = _.isEqual(this.side, "FRONT") ? "BACK" : "FRONT";
    }

    private filterSpecs(side: Info.SpecSide): SpecGroup[] {
        return _.filter(this.item.specGroups, (sg) => {
            return _.isEqual(sg.side, side);
        });
    }

    getSpecs(side: Info.SpecSide): SpecGroup[] {
        return this.filterSpecs(side);
    }

    openSpec(spec: SpecGroup) {
        logger.debug(() => `Open Spec: ${spec.key}`);
        this.modal.create(SpecDialog, { spec: spec }).present();
    }
}
