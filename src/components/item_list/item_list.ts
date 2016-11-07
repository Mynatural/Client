import _ from "lodash";
import { Component, Input, Output, EventEmitter } from "@angular/core";

import { Item } from "../../providers/model/lineup/item";

@Component({
    selector: "fathens-item_list",
    templateUrl: "item_list.html"
})
export class ItemListComponent {
    @Input() items: Item[];
    @Input() title: string;
    @Input() message: string;
    @Input() withDesc = true;
    @Input() withPrice = true;

    @Output() choose = new EventEmitter<Item>();

    readonly priceName = "ベース価格";
    readonly priceUnit = "￥";
}
