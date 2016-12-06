import _ from "lodash";
import Im from "immutable";

import { Component } from "@angular/core";
import { NavController } from "ionic-angular";

import { Logger } from "../../providers/util/logging";

const logger = new Logger("AccountPage");

@Component({
    selector: 'page-account',
    templateUrl: 'account.html'
})
export class AccountPage {
    static readonly title = "アカウント情報";
    static readonly icon = "person";

    readonly title = AccountPage.title;
}
