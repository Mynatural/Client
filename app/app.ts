import { Component, ViewChild, PLATFORM_DIRECTIVES } from '@angular/core';
import { App, ionicBootstrap, Platform, Nav } from 'ionic-angular';
import { AppVersion, StatusBar, Splashscreen } from 'ionic-native';
import {CUSTOM_ICON_DIRECTIVES} from 'ionic2-custom-icons';

import {FATHENS_DIRECTIVES} from "./components/all";
import {FATHENS_PROVIDERS} from "./providers/all";
import { HomePage } from './pages/home/home';
import { HelpPage } from './pages/help/help';
import { TermsPage } from './pages/terms/terms';
import { withFabric } from "./util/fabric";
import { Logger } from "./util/logging";

@Component({
    templateUrl: "build/app.html"
})
export class MyApp {
    @ViewChild(Nav) nav: Nav;

    rootPage: any = HomePage;
    pages = [HomePage, HelpPage, TermsPage];
    menuTitle = "もくじ";

    isDevel: boolean = false;

    constructor(private app: App, platform: Platform) {
        platform.ready().then(async () => {
            // Okay, so the platform is ready and our plugins are available.
            // Here you can do any higher level native things you might need.
            StatusBar.styleDefault();
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

ionicBootstrap(MyApp, [
    FATHENS_PROVIDERS,
    {
        provide: PLATFORM_DIRECTIVES,
        useValue: [CUSTOM_ICON_DIRECTIVES, FATHENS_DIRECTIVES],
        multi: true
    }
]);
