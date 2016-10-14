import { Component, ViewChild } from "@angular/core";

import { GistComponent } from "../../components/gist/gist";

@Component({
    templateUrl: 'terms.html'
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
