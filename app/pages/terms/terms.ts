import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  templateUrl: 'build/pages/terms/terms.html'
})
export class TermsPage {
    static title = "利用規約";
    static icon = "contract";
    title = TermsPage.title;

    constructor(public navCtrl: NavController) {

    }

    static async create(name: String): Promise<String> {
        return _.isNil(name) ? "" : name;
    }
}
