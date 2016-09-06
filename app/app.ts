import { Component, ViewChild } from '@angular/core';
import { App, ionicBootstrap, Platform, Nav } from 'ionic-angular';
import { AppVersion, StatusBar, Splashscreen } from 'ionic-native';

import { HomePage } from './pages/home/home';
import { withFabric } from "./util/fabric";
import { Logger } from "./util/logging";

@Component({
    templateUrl: "build/app.html"
})
export class MyApp {
    @ViewChild(Nav) nav: Nav;

    rootPage: any = HomePage;

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
        this.nav.setRoot(page.component);
    }
}

ionicBootstrap(MyApp);
