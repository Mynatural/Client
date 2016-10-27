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

    pages = [HomePage, HelpPage, TermsPage];
    menuTitle = "もくじ";

    isReady = false;
    isDevel = false;

    constructor(private app: App, private platform: Platform) {
        this.init();
    }

    private async init() {
        await this.platform.ready()
        Splashscreen.hide();
        this.nav.setRoot(HomePage);
        this.isReady = true;

        this.isDevel = await Logger.isDevel();

        StatusBar.styleDefault();
        if (this.platform.is('android') && StatusBar.isVisible) {
            logger.debug(() => `Changing status bar ...`);
            StatusBar.backgroundColorByName("black");
        }
    }

    crash() {
        withFabric((fabric) => fabric.Crashlytics.crash("Manually crashed."));
    }

    openPage(page) {
        this.nav.setRoot(page);
    }
}
