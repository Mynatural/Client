import _ from "lodash";
import Im from "immutable";

import { Component } from "@angular/core";
import { NavController } from "ionic-angular";

import { CategoryController, Category } from "../../providers/model/lineup/category";
import { Item } from "../../providers/model/lineup/item";
import { Logger } from "../../providers/util/logging";

const logger = new Logger("CategorizedPage");

@Component({
    selector: 'page-categorized',
    templateUrl: 'categorized.html'
})
export class CategorizedPage {
    readonly title = "カテゴリ別";

    constructor(private ctgCtrl: CategoryController) { }
}
