import _ from "lodash";

import { Component } from "@angular/core";

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

    readonly sns = [
        new SocialConnection("Facebook", "FB-f-Logo__blue_72.png",
            async () => (await this.cognito.identity).isJoinFacebook,
            async () => await this.cognito.joinFacebook(),
            async () => await this.cognito.dropFacebook()
        ),
        new SocialConnection("Instagram", "Instagram-v051916-72.png",
            async () => false,
            async () => {},
            async () => {}
        ),
        new SocialConnection("LINE", "LINE_Icon-72.png",
            async () => false,
            async () => {},
            async () => {}
        )
    ]

    constructor(private cognito: Cognito) {
    }
}

export class SocialConnection {
    constructor(
        public readonly name,
        public readonly logo,
        private isConnected: () => Promise<boolean>,
        private connect: () => Promise<void>,
        private disconnect: () => Promise<void>
    ) {
        logger.debug(() => `Creating SocialConnection: ${this.name}`);
    }

    private _isConnected: boolean = false;
    private _isConnectedWait: Promise<boolean>;

    get toggle(): boolean {
        if (_.isNil(this._isConnectedWait)) {
            this._isConnectedWait = this.isConnected();
            this._isConnectedWait.then((v) => {
                this._isConnected = v;
            })
        }
        return this._isConnected;
    }

    set toggle(v: boolean) {
        this.update(v);
    }

    private async update(doConnect: boolean) {
        try {
            if (doConnect) {
                await this.connect();
            } else {
                await this.disconnect();
            }
        } catch (ex) {
            logger.warn(() => `Failed to update social connection: ${ex}`);
        } finally {
            this._isConnected = await this.isConnected();
        }
    }
}
