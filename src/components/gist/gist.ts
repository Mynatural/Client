import { Component, Input } from "@angular/core";
import { Http, Jsonp } from "@angular/http";

import { toPromise } from "../../providers/util/promising";
import { Logger } from "../../providers/util/logging";

const logger = new Logger("GistComponent");

@Component({
    selector: "fathens-gist",
    template: ""
})
export class GistComponent {
    constructor(private http: Http, private jsonp: Jsonp) { }

    private host = "https://gist.github.com";

    private resolveBase;
    private promiseBase = new Promise<any>((resolve, reject) => {
        this.resolveBase = resolve;
    })
    @Input() set id(v: string) {
        this.gistId = v;
        logger.info(() => `Loaded gist-id: ${v}`);
        this.load(v);
    }
    gistId: string;

    isReady = false;

    ngOnInit() {
        logger.info(() => `Initialized.`);
        this.resolveBase(document.getElementById(`${this.gistId}`));
    }

    async load(id: string) {
        const url = `${this.host}/${id}.json?callback=JSONP_CALLBACK`;
        logger.info(() => "Requesting JSONP: " + url);
        const res = await toPromise(this.jsonp.get(url));
        this.gistCallback(res.json());
        this.isReady = true;
    }

    private gistCallback(res) {
        const divString = res["div"];
        if (!_.isNil(divString)) {
            const div = document.createElement("div");
            div.innerHTML = divString;
            this.showGist(div, this.toHref(res["stylesheet"]));
        }
    }

    private toHref(hrefString: string): string {
        if (_.isNil(hrefString)) return null;

        if (hrefString.startsWith("<link")) {
            const plain = hrefString.replace(/\\/, "");
            return /href="([^\s]*)"/.exec(plain)[1];
        }
        if (!hrefString.startsWith("http")) {
            const sep = hrefString.startsWith("/") ? "" : "/";
            return this.host + sep + hrefString;
        }
        return hrefString;
    }

    private async showGist(div: HTMLDivElement, styleHref: string) {
        const base = await this.promiseBase;
        logger.info(() => `Append gist to ${base}`);

        const meta = div.querySelector(".gist-meta");
        if (!_.isNil(meta)) meta.remove();

        const css = await this.getStyle(styleHref);
        if (!_.isNil(css)) {
            const style = document.createElement("style");
            style.textContent = css;
            base.appendChild(style);
        }
        base.appendChild(div);
    }

    private async getStyle(href): Promise<string> {
        if (_.isNil(href)) {
            return null;
        }
        const res = await toPromise(this.http.get(href));
        return res.text();
    }
}
