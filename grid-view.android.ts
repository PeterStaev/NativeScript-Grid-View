﻿/*! *****************************************************************************
Copyright (c) 2015 Tangra Inc.

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

import observable = require("data/observable");
import definition = require("nativescript-grid-view");
import common = require("./grid-view-common");
import utils = require("utils/utils");
import layout = require("ui/layouts/layout");
import stackLayout = require("ui/layouts/stack-layout");
import view = require("ui/core/view");
import stylingStyle = require("ui/styling/style");

const ITEMLOADING = common.GridView.itemLoadingEvent;
const LOADMOREITEMS = common.GridView.loadMoreItemsEvent;
const ITEMTAP = common.GridView.itemTapEvent;
const REALIZED_INDEX = "realizedIndex";

global.moduleMerge(common, exports);

function notifyForItemAtIndex(gridView: definition.GridView, view: any, eventName: string, index: number)
{
    let args =
        <definition.GridItemEventData>
        {
            eventName: eventName
            , object: gridView
            , index: index
            , view: view
        };
    gridView.notify(args);
    return args;
}

export class GridView extends common.GridView
{
    private _android: android.widget.GridView;
    private _androidViewId: number;
    public _realizedItems = {};

    public _createUI()
    {
        this._android = new android.widget.GridView(this._context);
        this._android.setBackgroundColor(android.graphics.Color.TRANSPARENT);
        // Fixes issue with black random black items when scrolling
        this._android.setCacheColorHint(android.graphics.Color.TRANSPARENT);

        if (!this._androidViewId)
        {
            this._androidViewId = android.view.View.generateViewId();
        }
        this._android.setId(this._androidViewId);

        this.android.setAdapter(new GridViewAdapter(this));
        this.android.setNumColumns(android.widget.GridView.AUTO_FIT);
        this.android.setStretchMode(android.widget.GridView.STRETCH_SPACING);
        this._resetNativeColumnAndSpacingSettings();

        let that = new WeakRef(this);

        this.android.setOnScrollListener(new android.widget.AbsListView.OnScrollListener({
            onScrollStateChanged:
            function (view: android.widget.AbsListView, scrollState: number)
            {
                // Empty
            },
            onScroll:
            function (view: android.widget.AbsListView, firstVisibleItem: number, visibleItemCount: number, totalItemCount: number)
            {
                let owner: GridView = this.owner;
                if (!owner)
                {
                    return;
                }

                if (totalItemCount > 0
                    && firstVisibleItem + visibleItemCount === totalItemCount
                )
                {
                    owner.notify(<observable.EventData>{ eventName: LOADMOREITEMS, object: owner });
                }
            }
        }));

        this.android.setOnItemClickListener(new android.widget.AdapterView.OnItemClickListener({
            onItemClick:
            function (parent: any, convertView: android.view.View, index: number, id: number)
            {
                let owner = that.get();

                notifyForItemAtIndex(owner, owner._getRealizedView(convertView), ITEMTAP, index);
            }
        }));
    }

    get android(): android.widget.GridView
    {
        return this._android;
    }

    private _resetNativeColumnAndSpacingSettings()
    {
        this.android.setColumnWidth(this.colWidth * utils.layout.getDisplayDensity());
        this.android.setVerticalSpacing(this.verticalSpacing * utils.layout.getDisplayDensity());
        this.android.setHorizontalSpacing(this.horizontalSpacing * utils.layout.getDisplayDensity());
    }

    public refresh()
    {
        if (!this._android
            || !this._android.getAdapter()
            )
        {
            return;
        }

        this._resetNativeColumnAndSpacingSettings();
        (<GridViewAdapter>this.android.getAdapter()).notifyDataSetChanged();
    }

    public _onDetached(force?: boolean)
    {
        super._onDetached(force);

        // clear the cache
        let keys = Object.keys(this._realizedItems);
        let i;
        let length = keys.length;
        let view: view.View;
        let key;

        for (i = 0; i < length; i++)
        {
            key = keys[i];
            view = this._realizedItems[key];
            view.parent._removeView(view);
            delete this._realizedItems[key];
        }
    }

    public _getRealizedView(convertView: android.view.View)
    {
        if (!convertView)
        {
            return this._getItemTemplateContent();
        }

        return this._realizedItems[convertView.hashCode()];
    }
}

class GridViewAdapter extends android.widget.BaseAdapter
{
    private _gridView: GridView;

    constructor(gridView: GridView)
    {
        super();

        this._gridView = gridView;

        return global.__native(this);
    }

    public getCount()
    {
        return this._gridView && this._gridView.items ? this._gridView.items.length : 0;
    }

    public getItem(i: number)
    {
        if (this._gridView
            && this._gridView.items
            && i < this._gridView.items.length
            )
        {
            return this._gridView.items.getItem ? this._gridView.items.getItem(i) : this._gridView.items[i];
        }

        return null;
    }

    public getItemId(i: number)
    {
        return long(i);
    }

    public hasStableIds(): boolean
    {
        return true;
    }

    public getView(index: number, convertView: android.view.View, parent: android.view.ViewGroup): android.view.View
    {
        if (!this._gridView)
        {
            return null;
        }

        let view = this._gridView._getRealizedView(convertView);

        notifyForItemAtIndex(this._gridView, view, ITEMLOADING, index);

        if (view)
        {
            if (!view.parent)
            {
                if (view instanceof layout.Layout)
                {
                    (<layout.Layout>view).height = this._gridView.rowHeight;
                    this._gridView._addView(view);
                    convertView = view.android;
                }
                else
                {
                    let sp = new stackLayout.StackLayout();
                    sp.height = this._gridView.rowHeight;
                    sp.addChild(view);
                    this._gridView._addView(sp);

                    convertView = sp.android;
                }

            }

            convertView.setLayoutParams(new android.widget.GridView.LayoutParams(this._gridView.colWidth * utils.layout.getDisplayDensity(), this._gridView.rowHeight * utils.layout.getDisplayDensity()));

            this._gridView._realizedItems[convertView.hashCode()] = view;
            view[REALIZED_INDEX] = index;

            this._gridView._prepareItem(view, index);
        }

        return convertView;
    }
}

//#region Styling
interface Padding
{
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
}
function setPadding(gridView: GridView, padding: Padding)
{
    let finalPadding: Padding =
        {
            top: padding.top !== undefined ? padding.top * utils.layout.getDisplayDensity() : gridView.android.getPaddingTop()
            , right: padding.right !== undefined ? padding.right * utils.layout.getDisplayDensity() : gridView.android.getPaddingRight()
            , bottom: padding.bottom !== undefined ? padding.bottom * utils.layout.getDisplayDensity() : gridView.android.getPaddingBottom()
            , left: padding.left !== undefined ? padding.left * utils.layout.getDisplayDensity() : gridView.android.getPaddingLeft()
        };

    gridView.android.setPadding(finalPadding.left, finalPadding.top, finalPadding.right, finalPadding.bottom);
}

//#region Padding Top Property
function setPaddingTop(gridView: GridView, newValue: number)
{
    setPadding(gridView, { top: newValue });
}
function resetPaddingTop(gridView: GridView, nativeValue: number)
{
    setPaddingTop(gridView, nativeValue);
}
function getNativePaddingTopValue(gridView: GridView): any
{
    return gridView.android.getPaddingTop();
}
let paddingTopChangedHandler = new stylingStyle.StylePropertyChangedHandler(setPaddingTop, resetPaddingTop, getNativePaddingTopValue);
stylingStyle.registerHandler(stylingStyle.paddingTopProperty, paddingTopChangedHandler, "GridView");
//#endregion

//#region Padding Right Property
function setPaddingRight(gridView: GridView, newValue: number)
{
    setPadding(gridView, { right: newValue });
}
function resetPaddingRight(gridView: GridView, nativeValue: number)
{
    setPaddingRight(gridView, nativeValue);
}
function getNativePaddingRightValue(gridView: GridView): any
{
    return gridView.android.getPaddingRight();
}
let paddingRightChangedHandler = new stylingStyle.StylePropertyChangedHandler(setPaddingRight, resetPaddingRight, getNativePaddingRightValue);
stylingStyle.registerHandler(stylingStyle.paddingRightProperty, paddingRightChangedHandler, "GridView");
//#endregion

//#region Padding Bottom Property
function setPaddingBottom(gridView: GridView, newValue: number)
{
    setPadding(gridView, { bottom: newValue });
}
function resetPaddingBottom(gridView: GridView, nativeValue: number)
{
    setPaddingBottom(gridView, nativeValue);
}
function getNativePaddingBottomValue(gridView: GridView): any
{
    return gridView.android.getPaddingBottom();
}
let paddingBottomChangedHandler = new stylingStyle.StylePropertyChangedHandler(setPaddingBottom, resetPaddingBottom, getNativePaddingBottomValue);
stylingStyle.registerHandler(stylingStyle.paddingBottomProperty, paddingBottomChangedHandler, "GridView");
//#endregion

//#region Padding Left Property
function setPaddingLeft(gridView: GridView, newValue: number)
{
    setPadding(gridView, { left: newValue });
}
function resetPaddingLeft(gridView: GridView, nativeValue: number)
{
    setPaddingLeft(gridView, nativeValue);
}
function getNativePaddingLeftValue(gridView: GridView): any
{
    return gridView.android.getPaddingLeft();
}
let paddingLeftChangedHandler = new stylingStyle.StylePropertyChangedHandler(setPaddingLeft, resetPaddingLeft, getNativePaddingLeftValue);
stylingStyle.registerHandler(stylingStyle.paddingLeftProperty, paddingLeftChangedHandler, "GridView");
//#endregion

//#endregion