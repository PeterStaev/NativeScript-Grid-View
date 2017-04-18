/*! *****************************************************************************
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
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var common = require("./grid-view-common");
var utils = require("utils/utils");
var layoutBase = require("ui/layouts/layout-base");
var stackLayout = require("ui/layouts/stack-layout");
var style = require("ui/styling/style");
var ITEMLOADING = common.GridView.itemLoadingEvent;
var LOADMOREITEMS = common.GridView.loadMoreItemsEvent;
var ITEMTAP = common.GridView.itemTapEvent;
var REALIZED_INDEX = "realizedIndex";
global.moduleMerge(common, exports);
function notifyForItemAtIndex(gridView, view, eventName, index) {
    var args = {
        eventName: eventName,
        object: gridView,
        index: index,
        view: view
    };
    gridView.notify(args);
    return args;
}
var GridView = (function (_super) {
    __extends(GridView, _super);
    function GridView() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._realizedItems = {};
        return _this;
    }
    GridView.prototype._createUI = function () {
        this._android = new android.widget.GridView(this._context);
        this._android.setBackgroundColor(android.graphics.Color.TRANSPARENT);
        // Fixes issue with black random black items when scrolling
        this._android.setCacheColorHint(android.graphics.Color.TRANSPARENT);
        if (!this._androidViewId) {
            this._androidViewId = android.view.View.generateViewId();
        }
        this._android.setId(this._androidViewId);
        this.android.setAdapter(new GridViewAdapter(this));
        this.android.setNumColumns(android.widget.GridView.AUTO_FIT);
        this.android.setStretchMode(android.widget.GridView.STRETCH_SPACING);
        this._resetNativeColumnAndSpacingSettings();
        var that = new WeakRef(this);
        this.android.setOnScrollListener(new android.widget.AbsListView.OnScrollListener({
            onScrollStateChanged: function (view, scrollState) {
                // Empty
            },
            onScroll: function (view, firstVisibleItem, visibleItemCount, totalItemCount) {
                var owner = this.owner;
                if (!owner) {
                    return;
                }
                if (totalItemCount > 0
                    && firstVisibleItem + visibleItemCount === totalItemCount) {
                    owner.notify({ eventName: LOADMOREITEMS, object: owner });
                }
            },
            get owner() { return that.get(); }
        }));
        this.android.setOnItemClickListener(new android.widget.AdapterView.OnItemClickListener({
            onItemClick: function (parent, convertView, index, id) {
                var owner = that.get();
                notifyForItemAtIndex(owner, owner._getRealizedView(convertView), ITEMTAP, index);
            }
        }));
    };
    Object.defineProperty(GridView.prototype, "android", {
        get: function () {
            return this._android;
        },
        enumerable: true,
        configurable: true
    });
    GridView.prototype._resetNativeColumnAndSpacingSettings = function () {
        this.android.setColumnWidth(this.colWidth * utils.layout.getDisplayDensity());
        this.android.setVerticalSpacing(this.verticalSpacing * utils.layout.getDisplayDensity());
        this.android.setHorizontalSpacing(this.horizontalSpacing * utils.layout.getDisplayDensity());
    };
    GridView.prototype.refresh = function () {
        if (!this._android
            || !this._android.getAdapter()) {
            return;
        }
        this._resetNativeColumnAndSpacingSettings();
        this.android.getAdapter().notifyDataSetChanged();
    };
    GridView.prototype._onDetached = function (force) {
        _super.prototype._onDetached.call(this, force);
        // clear the cache
        var keys = Object.keys(this._realizedItems);
        var i;
        var length = keys.length;
        var view;
        var key;
        for (i = 0; i < length; i++) {
            key = keys[i];
            view = this._realizedItems[key];
            view.parent._removeView(view);
            delete this._realizedItems[key];
        }
    };
    GridView.prototype._getRealizedView = function (convertView) {
        if (!convertView) {
            return this._getItemTemplateContent();
        }
        return this._realizedItems[convertView.hashCode()];
    };
    return GridView;
}(common.GridView));
exports.GridView = GridView;
var GridViewAdapter = (function (_super) {
    __extends(GridViewAdapter, _super);
    function GridViewAdapter(gridView) {
        var _this = _super.call(this) || this;
        _this._gridView = gridView;
        return global.__native(_this);
    }
    GridViewAdapter.prototype.getCount = function () {
        return this._gridView && this._gridView.items ? this._gridView.items.length : 0;
    };
    GridViewAdapter.prototype.getItem = function (i) {
        if (this._gridView
            && this._gridView.items
            && i < this._gridView.items.length) {
            return this._gridView.items.getItem ? this._gridView.items.getItem(i) : this._gridView.items[i];
        }
        return null;
    };
    GridViewAdapter.prototype.getItemId = function (i) {
        return long(i);
    };
    GridViewAdapter.prototype.hasStableIds = function () {
        return true;
    };
    GridViewAdapter.prototype.getView = function (index, convertView, parent) {
        if (!this._gridView) {
            return null;
        }
        var view = this._gridView._getRealizedView(convertView);
        notifyForItemAtIndex(this._gridView, view, ITEMLOADING, index);
        if (view) {
            this._gridView._prepareItem(view, index);
            view.height = this._gridView.rowHeight;
            view.width = this._gridView.colWidth;
            if (!view.parent) {
                if (view instanceof layoutBase.LayoutBase) {
                    this._gridView._addView(view);
                    convertView = view.android;
                }
                else {
                    var sp = new stackLayout.StackLayout();
                    sp.addChild(view);
                    this._gridView._addView(sp);
                    convertView = sp.android;
                }
            }
            this._gridView._realizedItems[convertView.hashCode()] = view;
            view[REALIZED_INDEX] = index;
        }
        return convertView;
    };
    return GridViewAdapter;
}(android.widget.BaseAdapter));
//#region Styling
var GridViewStyler = (function () {
    function GridViewStyler() {
    }
    GridViewStyler.setPadding = function (gridView, padding) {
        var finalPadding = {
            top: padding.top !== undefined ? padding.top * utils.layout.getDisplayDensity() : gridView.android.getPaddingTop(),
            right: padding.right !== undefined ? padding.right * utils.layout.getDisplayDensity() : gridView.android.getPaddingRight(),
            bottom: padding.bottom !== undefined ? padding.bottom * utils.layout.getDisplayDensity() : gridView.android.getPaddingBottom(),
            left: padding.left !== undefined ? padding.left * utils.layout.getDisplayDensity() : gridView.android.getPaddingLeft()
        };
        gridView.android.setPadding(finalPadding.left, finalPadding.top, finalPadding.right, finalPadding.bottom);
    };
    //#region Padding Top Property
    GridViewStyler.setPaddingTop = function (gridView, newValue) {
        GridViewStyler.setPadding(gridView, { top: newValue });
    };
    GridViewStyler.resetPaddingTop = function (gridView, nativeValue) {
        GridViewStyler.setPaddingTop(gridView, nativeValue);
    };
    GridViewStyler.getNativePaddingTopValue = function (gridView) {
        return gridView.android.getPaddingTop();
    };
    //#endregion
    //#region Padding Right Property
    GridViewStyler.setPaddingRight = function (gridView, newValue) {
        GridViewStyler.setPadding(gridView, { right: newValue });
    };
    GridViewStyler.resetPaddingRight = function (gridView, nativeValue) {
        GridViewStyler.setPaddingRight(gridView, nativeValue);
    };
    GridViewStyler.getNativePaddingRightValue = function (gridView) {
        return gridView.android.getPaddingRight();
    };
    //#endregion
    //#region Padding Bottom Property
    GridViewStyler.setPaddingBottom = function (gridView, newValue) {
        GridViewStyler.setPadding(gridView, { bottom: newValue });
    };
    GridViewStyler.resetPaddingBottom = function (gridView, nativeValue) {
        GridViewStyler.setPaddingBottom(gridView, nativeValue);
    };
    GridViewStyler.getNativePaddingBottomValue = function (gridView) {
        return gridView.android.getPaddingBottom();
    };
    //#endregion
    //#region Padding Left Property
    GridViewStyler.setPaddingLeft = function (gridView, newValue) {
        GridViewStyler.setPadding(gridView, { left: newValue });
    };
    GridViewStyler.resetPaddingLeft = function (gridView, nativeValue) {
        GridViewStyler.setPaddingLeft(gridView, nativeValue);
    };
    GridViewStyler.getNativePaddingLeftValue = function (gridView) {
        return gridView.android.getPaddingLeft();
    };
    //#endregion
    GridViewStyler.registerHandlers = function () {
        style.registerHandler(style.paddingTopProperty, new style.StylePropertyChangedHandler(GridViewStyler.setPaddingTop, GridViewStyler.resetPaddingTop, GridViewStyler.getNativePaddingTopValue), "GridView");
        style.registerHandler(style.paddingRightProperty, new style.StylePropertyChangedHandler(GridViewStyler.setPaddingRight, GridViewStyler.resetPaddingRight, GridViewStyler.getNativePaddingRightValue), "GridView");
        style.registerHandler(style.paddingBottomProperty, new style.StylePropertyChangedHandler(GridViewStyler.setPaddingBottom, GridViewStyler.resetPaddingBottom, GridViewStyler.getNativePaddingBottomValue), "GridView");
        style.registerHandler(style.paddingLeftProperty, new style.StylePropertyChangedHandler(GridViewStyler.setPaddingLeft, GridViewStyler.resetPaddingLeft, GridViewStyler.getNativePaddingLeftValue), "GridView");
    };
    return GridViewStyler;
}());
exports.GridViewStyler = GridViewStyler;
GridViewStyler.registerHandlers();
//#endregion 
