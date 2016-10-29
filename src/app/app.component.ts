import { Component, ViewChild } from "@angular/core";
import { App, Platform, Nav } from "ionic-angular";
import { StatusBar, Splashscreen } from "ionic-native";

import { HomePage } from "../pages/home/home";
import { HelpPage } from "../pages/help/help";
import { TermsPage } from "../pages/terms/terms";
import { withFabric } from "../providers/util/fabric";
import { Logger } from "../providers/util/logging";

const logger = new Logger("MyApp");

@Component({
    templateUrl: "app.component.html"
})
export class MyApp {
    @ViewChild(Nav) nav: Nav;

    rootPage = HomePage;
    pages = [HomePage, HelpPage, TermsPage];
    menuTitle = "もくじ";

    isDevel = false;

    constructor(private app: App, private platform: Platform) {
        this.init();
    }

    private async init() {
        await this.platform.ready();
        logger.info(() => `Platform is ready.`);

        Splashscreen.hide();
        if (!this.platform.is("android")) {
            StatusBar.styleDefault();
        }

        this.isDevel = await Logger.isDevel();
    }

    crash() {
        withFabric((fabric) => fabric.Crashlytics.crash("Manually crashed."));
    }

    openPage(page) {
        this.nav.setRoot(page);
    }
}
