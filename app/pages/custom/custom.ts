import {Component} from "@angular/core";
import {SafeUrl} from '@angular/platform-browser';
import {NavController, NavParams} from "ionic-angular";

import {S3Image} from "../../providers/aws/s3file";
import {Logger} from "../../util/logging";

const logger = new Logger("CustomPage");

@Component({
    templateUrl: 'build/pages/custom/custom.html'
})
export class CustomPage {
    title: string;
    itemKey: string;

    constructor(private params: NavParams) {
        this.itemKey = params.get('key');
        this.title = params.get('name');
    }

    turn_over() {
        logger.debug(() => `TurnOver`);
    }
}
