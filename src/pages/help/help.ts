import { Component } from "@angular/core";
import { NavController } from "ionic-angular";

@Component({
    selector: 'page-help',
    templateUrl: 'help.html'
})
export class HelpPage {
    static title = "サービス案内";
    static icon = "bonfire";
    title = HelpPage.title;

    constructor(public navCtrl: NavController) {

    }

    static async create(name: String): Promise<String> {
        return _.isNil(name) ? "" : name;
    }
}
