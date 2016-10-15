import { Injectable } from "@angular/core";
import { Http } from "@angular/http";

import { toPromise } from "../util/promising";
import { Logger } from "../util/logging";

const logger = new Logger("BootSettings");

@Injectable()
export class BootSettings {
    private static src: { [key: string]: string; } = null;

    constructor(private http: Http) { }

    private async get(key: string): Promise<string> {
        if (_.isNil(BootSettings.src)) {
            logger.debug(() => `Loading settings.json...`);
            const res = await toPromise(this.http.get("settings.json"));
            BootSettings.src = JSON.parse(res.text());
        }
        return BootSettings.src[key];
    }

    get awsRegion(): Promise<string> {
        return this.get("awsRegion");
    }

    get cognitoPoolId(): Promise<string> {
        return this.get("cognitoPoolId");
    }

    get s3Bucket(): Promise<string> {
        return this.get("s3Bucket");
    }
}
