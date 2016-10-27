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

    rootPage: any = HomePage;
    pages = [HomePage, HelpPage, TermsPage];
    menuTitle = "もくじ";

    isDevel: boolean = false;

    constructor(private app: App, platform: Platform) {
        platform.ready().then(async () => {
            Splashscreen.hide();
            if (platform.is('android')) {
                logger.debug(() => `Changing status bar ...`);
                StatusBar.hide();
            }
            this.isDevel = await Logger.isDevel();
        });
    }

    crash() {
        withFabric((fabric) => fabric.Crashlytics.crash("Manually crashed."));
    }

    openPage(page) {
        this.nav.setRoot(page);
    }
}
