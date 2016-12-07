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
    readonly titleConnections = "認証サービス";
    readonly titlePoints = "ポイント";

    readonly sns = [
        new SocialConnection("Facebook", "FB-f-Logo__blue_72.png",
            async () => (await this.cognito.identity).isJoinFacebook,
            async () => await this.cognito.joinFacebook(),
            async () => await this.cognito.dropFacebook()
        ),
        new SocialConnection("LINE", "LINE_Icon-72.png",
            async () => (await this.cognito.identity).isJoinLINE,
            async () => await this.cognito.joinLINE(),
            async () => await this.cognito.dropLINE()
        ),
        new SocialConnection("Twitter", "Twitter_Logo_White_On_Blue-72.png",
            async () => (await this.cognito.identity).isJoinTwitter,
            async () => await this.cognito.joinTwitter(),
            async () => await this.cognito.dropTwitter()
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
        this.isConnected().then((v) => {
            this.toggle = v;
        })
    }

    toggle: boolean = false;

    async update() {
        const v = this.toggle;
        if (v === await this.isConnected()) {
            logger.info(() => `Nothing to do, ${this.name} connection is already '${v}'`);
            return;
        }
        logger.debug(() => `Updating ${this.name} connection to '${v}'`);
        try {
            if (v) {
                await this.connect();
            } else {
                await this.disconnect();
            }
        } catch (ex) {
            logger.warn(() => `Failed to update ${this.name} connection(${v}): ${ex}`);
        }
        setTimeout(async () => {
            this.toggle = await this.isConnected();
            logger.debug(() => `Updated ${this.name} connection: ${this.toggle}`);
        }, 100);
    }
}
