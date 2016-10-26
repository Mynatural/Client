import { Component, ViewChild } from "@angular/core";
import { App, Platform, Nav } from "ionic-angular";
import { AppVersion, StatusBar, Splashscreen } from "ionic-native";

import { HomePage } from "../pages/home/home";
import { HelpPage } from "../pages/help/help";
import { TermsPage } from "../pages/terms/terms";
import { withFabric } from "../providers/util/fabric";
import { Logger } from "../providers/util/logging";

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
            await Logger.setLebelByVersionNumber();
            try {
                const version: string = await AppVersion.getVersionNumber();
                const v = parseInt(_.last(version.match(/[0-9]/g)));
                this.isDevel = v % 2 !== 0;
            } catch (ex) { }
        });
    }

    crash() {
        withFabric((fabric) => fabric.Crashlytics.crash("Manually crashed."));
    }

    openPage(page) {
        this.nav.setRoot(page);
    }
}
