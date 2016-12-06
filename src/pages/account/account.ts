import _ from "lodash";
import Im from "immutable";

import { Component } from "@angular/core";
import { NavController } from "ionic-angular";

import { Cognito } from "../../providers/aws/cognito";
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
    readonly titleConnections = "接続サービス";
    readonly titlePoints = "ポイント";

    faceook: boolean = false;
    instagram: boolean = false;
    line: boolean = false;

    constructor(private cognito: Cognito) {
    }

    async connectFacebook(): Promise<void> {
        await this.cognito.joinFacebook();
    }

    async disconnectFacebook(): Promise<void> {
        await this.cognito.dropFacebook();
    }

}
