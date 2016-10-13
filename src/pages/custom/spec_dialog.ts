import { Component } from '@angular/core';
import { ViewController, NavParams } from "ionic-angular";

import Lineup from "../../providers/model/lineup";
import { Logger } from "../../providers/util/logging";

const logger = new Logger("SpecDialog");

@Component({
    selector: 'page-custom-spec_dialog',
    templateUrl: 'spec_dialog.html'
})
export class SpecDialog {
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
