import {Component, Input} from "@angular/core";
import {SafeUrl, DomSanitizationService} from '@angular/platform-browser';
import {Storage, LocalStorage} from 'ionic-angular';

import {S3File} from "../../providers/aws/s3file";
import {FATHENS_PROVIDERS} from "../../providers/all";
import {assert} from "../../util/assertion";
import {Logger} from "../../util/logging";

const logger = new Logger("SuggestionsComponent");

const storageName = "s3cache";

@Component({
    selector: "s3image",
    templateUrl: "build/components/s3image/s3image.html",
    providers: [FATHENS_PROVIDERS]
})
export class S3ImageComponent {
    private local: Storage = new Storage(LocalStorage);

    constructor(private s3file: S3File, private sanitizer: DomSanitizationService) { }

    @Input() set path(v: string) {
        this.s3path = v;
        this.getUrl().then((url) => {
            this.url = this.sanitizer.bypassSecurityTrustUrl(url);
        });
    }
    private s3path: string;
    url: SafeUrl;

    private async getUrl(): Promise<string> {
        if (_.isNil(this.url)) {
            try {
                const data = await this.local.get(this.s3path);
                if (!_.isNil(data)) {
                    return data;
                }
            } catch (ex) {
                logger.info(() => `Failed to get local data: ${this.s3path}`);
            }
            const blob = await this.s3file.download(this.s3path);
            const url = URL.createObjectURL(blob);
            this.local.set(this.s3path, url);
            return url;
        }
    }
}
