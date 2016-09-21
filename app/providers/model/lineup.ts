import {Injectable} from "@angular/core";
import {SafeUrl} from '@angular/platform-browser';

import {S3Image} from "../aws/s3file";
import {Logger} from "../../util/logging";

const logger = new Logger("Lineup");

const allList = [
    { key: "short-sleeved", name: "はんそで" },
    { key: "long-sleeved", name: "ながそで" },
    { key: "no-sleeved", name: "そでなし" },
    { key: "jinbei", name: "じんべい" },
];

@Injectable()
export class Lineups {
    constructor(private s3: S3Image) {
        this.all = Promise.all(allList.map(async (item) => {
            const url = await s3.getUrl(`unauthorized/images/lineup/${item.key}.jpg`)
            return new Lineup(item.key, item.name, url);
        }));
    }

    all: Promise<Lineup[]>;

    async get(key: string): Promise<Lineup> {
        const list = await this.all;
        return _.find(list, {"key": key});
    }
}

export class Lineup {
    constructor(private myKey: string, private myName: string, private myUrl: SafeUrl) { }

    get key(): string {
        return this.myKey;
    }

    get name(): string {
        return this.myName;
    }

    get imageUrl(): SafeUrl {
        return this.myUrl;
    }
}
