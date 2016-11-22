import _ from "lodash";
import * as Json from "./_info.d";
import { LineupController } from "./lineup";
import { SpecGroup } from "./spec";
import { Measure } from "./measure";
import { CachedImage } from "../../aws/s3file";
import { InputInterval } from "../../util/input_interval";
import { Logger } from "../../util/logging";

const logger = new Logger("Lineup.Item");

export class ItemGroup {
    private static all: ItemGroup;

    static async byAll(ctrl: LineupController): Promise<ItemGroup> {
        if (_.isNil(ItemGroup.all)) {
            const itemGroup = new ItemGroup(ctrl, []);

            const keys = await ctrl.readItemsList();
            itemGroup.availables = _.filter(await Promise.all(_.map(keys, async (key) => {
                try {
                    const json = await ctrl.loadItem(key);
                    return Item.byJSON(ctrl, itemGroup, key, json);
                } catch (ex) {
                    logger.warn(() => `Failed to load '${key}': ${ex}`);
                    return null;
                }
            })));

            ItemGroup.all = itemGroup;
        }
        return ItemGroup.all;
    }

    private constructor(private ctrl: LineupController, public availables: Item[]) { }

    get(key: string): Item {
        return _.find(this.availables, {"key": key});
    }

    async remove(o: Item): Promise<void> {
        await this.ctrl.onRemoving.itemValue(o, async () => {
            _.remove(this.availables, (a) => _.isEqual(a.key, o.key));
        })
    }

    async createNew(): Promise<Item> {
        const key = await this.ctrl.createNewKey("new_created", async (key) => _.find(this.availables, {key: key}));
        const one = new Item(this.ctrl, this, key, {}, "新しいラインナップ", "", 500, [], []);
        this.availables.unshift(one);
        return one;
    }

    async writeAll(): Promise<void> {
        await this.ctrl.writeItemsList(_.map(this.availables, (a) => a.key));
        await Promise.all(_.map(this.availables, (a) => a.writeInfo()));
    }
}

export class Item {
    static async byJSON(ctrl: LineupController, itemGroup: ItemGroup, key: string, json: Json.Item): Promise<Item> {
        logger.info(() => `${key}: ${JSON.stringify(json, null, 4)}`);
        const result = new Item(ctrl, itemGroup, key, json.flags || {}, json.name, json.description, json.price, [], []);

        result.specGroups = await SpecGroup.byJSONs(ctrl, result, json.specGroups, json.specs);
        result.measurements = await Promise.all(_.map(json.measurements, (j) => Measure.byJSON(ctrl, result, j)));

        return result;
    }

    private _titleImage: CachedImage;
    private _images: {[key: string]: CachedImage}; // SpecSide -> CachedImage
    private _changeKey: InputInterval<string> = new InputInterval<string>(1000);

    constructor(private ctrl: LineupController,
            public itemGroup: ItemGroup,
            private _key: string,
            public flags: {[key: string]: string},
            public name: string,
            public description: string,
            public price: number,
            public specGroups: SpecGroup[],
            public measurements: Measure[]
    ) { }

    get asJSON() {
        const localSpecs = _.uniqBy(_.filter(_.flatMap(this.specGroups,
            (sg) => sg.availables), (s) => !s.isGlobal), "key"
        );
        return {
            key: this.key,
            name: this.name,
            price: this.price,
            flags: this.flags,
            description: this.description,
            specGroups: _.map(this.specGroups, (o) => o.asJSON),
            specs: _.map(localSpecs, (o) => o.asJSON),
            measurements: _.map(this.measurements, (o) => o.asJSON)
        };
    }

    async writeInfo(): Promise<void> {
        await this.ctrl.writeItem(this.key, this.asJSON);
    }

    get key(): string {
        return this._key;
    }

    set key(v: string) {
        this.ctrl.checkKey(v);
        if (!_.isEqual(this.key, v) && !_.isNil(this.itemGroup.get(v))) throw "Exist key";

        this._changeKey.update(v, async (v) => {
            await this.ctrl.onChanging.itemKey(this, async () => {
                this._key = v;
            });
        });
    }

    refreshIllustrations() {
        this.refreshTiteImage(true);
        this.refreshCurrentImages(true);
    }

    onChangedSpecCurrent() {
        this.refreshCurrentImages(true);
    }

    private refreshTiteImage(clear = false): CachedImage {
        if (clear || _.isNil(this._titleImage)) {
            this._titleImage = this.ctrl.illust.itemTitle(this);
        }
        return this._titleImage;
    }

    get titleImage(): CachedImage {
        return this.refreshTiteImage();
    }

    async changeTitleImage(file: File): Promise<void> {
        await this.ctrl.illust.uploadItemTitle(this, file);
        this.refreshTiteImage(true);
    }

    private refreshCurrentImages(clear = false): {[key: string]: CachedImage} {
        if (clear || _.isEmpty(this._images)) {
            this._images = this.ctrl.illust.itemCurrent(this);
        }
        return this._images;
    }

    getImage(side: Json.SpecSide): CachedImage {
        return this.refreshCurrentImages()[side];
    }

    async changeImage(side: Json.SpecSide, file: File): Promise<void> {
        await this.ctrl.illust.uploadItemCurrent(this, side, file);
        this.refreshCurrentImages(true);
    }

    get totalPrice(): number {
        var result = this.price;
        _.forEach(this.specGroups, (spec, key) => {
            const v = spec.current;
            if (v) {
                result = result + v.price;
            }
        });
        return result;
    }

    getSpec(key: string): SpecGroup {
        return _.find(this.specGroups, {key: key});
    }

    async removeSpec(o: SpecGroup): Promise<void> {
        await this.ctrl.onRemoving.specGroup(o, async () => {
            _.remove(this.specGroups, {key: o.key});
        });
    }

    async createSpec(): Promise<SpecGroup> {
        const key = await this.ctrl.createNewKey("new_spec", async (key) => this.getSpec(key));
        const one = new SpecGroup(this.ctrl, this,
            key, "新しい仕様", "FRONT", null, []);
        await one.createNew();
        this.specGroups.unshift(one);
        return one;
    }

    getMeasure(key: string): Measure {
        return _.find(this.measurements, {key: key});
    }

    async removeMeasure(o: Measure): Promise<void> {
        await this.ctrl.onRemoving.measure(o, async () => {
            _.remove(this.measurements, {key: o.key});
        });
    }

    async createMeasure(): Promise<Measure> {
        const key = await this.ctrl.createNewKey("new_measure", async (key) => this.getMeasure(key));
        const one = new Measure(this.ctrl, this, key, "新しい寸法", "", 10, 10, 100, 1);
        this.measurements.unshift(one);
        return one;
    }
}
