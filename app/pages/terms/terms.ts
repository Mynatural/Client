import {Component, ViewChild} from '@angular/core';

import {GistComponent} from "../../components/gist/gist";
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

    @ViewChild(GistComponent) gist;

    get isReady() {
        return this.gist.isReady;
    }
}
