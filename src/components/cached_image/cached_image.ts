import _ from "lodash";
import { Component, Input } from "@angular/core";

import { CachedImage } from "../../providers/aws/s3file";

export type Status = "NO_IMAGE" | "LOADING" | "LOADED";

@Component({
    selector: "fathens-cached_image",
    templateUrl: "cached_image.html"
})
export class CachedImageComponent {
    @Input() target: CachedImage;

    readonly NO_IMAGE: Status = "NO_IMAGE";
    readonly LOADING: Status = "LOADING";
    readonly LOADED: Status = "LOADED";

    get status(): Status {
        if (_.isNil(this.target)) {
            return this.NO_IMAGE;
        } else if (this.target.isLoading) {
            return this.LOADING;
        } else if (_.isNil(this.target.url)) {
            return this.NO_IMAGE;
        }
        return this.LOADED;
    }

}
