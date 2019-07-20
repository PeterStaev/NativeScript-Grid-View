/*! *****************************************************************************
Copyright (c) 2019 Tangra Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
***************************************************************************** */

import { KeyedTemplate, PercentLength, Template, ContainerView } from "tns-core-modules/ui/core/view";
import { ItemsSource, ItemEventData, TemplatedItemsView } from "tns-core-modules/ui/list-view";
import { EventData } from "tns-core-modules/data/observable";

export type Orientation = "horizontal" | "vertical"

export class GridView extends ContainerView implements TemplatedItemsView {
    public static itemLoadingEvent: string;
    public static itemTapEvent: string;
    public static loadMoreItemsEvent: string;
    public static scrollEvent: string;

    public items: any[] | ItemsSource;
    public itemTemplate: string | Template;
    public itemTemplates: string | KeyedTemplate[];
    public rowHeight: PercentLength;
    public colWidth: PercentLength;
    public orientation: Orientation;

    public ios: any; /* UICollectionView */
    public android: any; /* android.support.v7.widget.RecyclerView */

    public refresh();
    public scrollToIndex(index: number, animated?: boolean);

    on(eventNames: string, callback: (data: EventData) => void, thisArg?: any);
    on(event: "itemLoading", callback: (args: GridItemEventData) => void, thisArg?: any);
    // tslint:disable-next-line:unified-signatures
    on(event: "itemTap", callback: (args: GridItemEventData) => void, thisArg?: any);
    on(event: "loadMoreItems", callback: (args: EventData) => void, thisArg?: any);
}

export interface GridItemEventData extends ItemEventData {
}

export interface ScrollEventData extends EventData {
    eventName: string;
    object: GridView;
    scrollX: number;
    scrollY: number;
}
