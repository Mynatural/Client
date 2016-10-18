import { Component, Input } from "@angular/core";

import { CachedImage } from "../../providers/aws/s3file";

type Status = "NO_IMAGE" | "LOADING" | "LOADED";

@Component({
    selector: "fathens-cached_image",
    templateUrl: "cached_image.html"
})
export class CachedImageComponent {

    @Input() target: CachedImage;

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

    get NO_IMAGE(): Status {
        return "NO_IMAGE";
    }
    get LOADING(): Status {
        return "LOADING";
    }
    get LOADED(): Status {
        return "LOADED";
    }
}
