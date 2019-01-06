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

import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    IterableDiffers,
    forwardRef
} from "@angular/core";

import { TEMPLATED_ITEMS_COMPONENT, TemplatedItemsComponent } from "nativescript-angular/directives/templated-items-comp";
import { isKnownView, registerElement } from "nativescript-angular/element-registry";

import { GridView } from "../grid-view";

@Component({
    selector: "GridView",
    template: `
        <DetachedContainer>
            <Placeholder #loader></Placeholder>
        </DetachedContainer>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{ provide: TEMPLATED_ITEMS_COMPONENT, useExisting: forwardRef(() => GridViewComponent)}]
})
export class GridViewComponent extends TemplatedItemsComponent {
    public get nativeElement(): GridView {
        return this.templatedItemsView;
    }

    protected templatedItemsView: GridView;

    constructor(
        _elementRef: ElementRef,
        _iterableDiffers: IterableDiffers) {
        super(_elementRef, _iterableDiffers);
        
    }
}

if (!isKnownView("GridView")) {
    registerElement("GridView", () => GridView);
}
