import { Component } from "@angular/core";
import { ViewController, NavParams } from "ionic-angular";

import { SpecGroup, Spec } from "../../providers/model/lineup/spec";
import { Logger } from "../../providers/util/logging";

const logger = new Logger("SpecDialog");

@Component({
    selector: 'page-custom-spec_dialog',
    templateUrl: 'spec_dialog.html'
})
export class SpecDialog {
    spec: SpecGroup;
    title: string;

    textChoose = "選択";
    priceUnit = "￥";

    constructor(params: NavParams, private viewCtrl: ViewController) {
        this.spec = params.get("spec");
        this.title = this.spec.name;
    }

    close() {
        this.viewCtrl.dismiss();
    }

    choose(v: Spec) {
        logger.info(() => `Choose spec[${this.spec.key}]: ${v.key}`);
        this.spec.current = v;
        this.close();
    }
}
