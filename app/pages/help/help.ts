import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  templateUrl: 'build/pages/help/help.html'
})
export class HelpPage {
  constructor(public navCtrl: NavController) {

  }

  static async create(name: String): Promise<String> {
      return _.isNil(name) ? "" : name;
  }
}
