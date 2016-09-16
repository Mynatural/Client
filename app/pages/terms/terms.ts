import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import {FATHENS_DIRECTIVES} from "../../components/all";
import {FATHENS_PROVIDERS} from "../../providers/all";

@Component({
    templateUrl: 'build/pages/terms/terms.html',
    directives: [FATHENS_DIRECTIVES],
    providers: [FATHENS_PROVIDERS]
})
export class TermsPage {
    static title = "利用規約";
    static icon = "contract";
    title = TermsPage.title;
}
