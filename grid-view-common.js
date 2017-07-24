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
var observable = require("data/observable");
var proxy = require("ui/core/proxy");
var dependencyObservable = require("ui/core/dependency-observable");
var builder = require("ui/builder");
var view = require("ui/core/view");
var ITEMSCHANGED = "_itemsChanged";
var GRIDVIEW = "GridView";
var CHANGE = "change";
var knownTemplates;
(function (knownTemplates) {
    knownTemplates.itemTemplate = "itemTemplate";
})(knownTemplates = exports.knownTemplates || (exports.knownTemplates = {}));
function onItemsPropertyChanged(data) {
    var gridView = data.object;
    var itemsChanged = gridView[ITEMSCHANGED];
    if (data.oldValue instanceof observable.Observable) {
        data.oldValue.off(CHANGE, itemsChanged);
    }
    if (data.newValue instanceof observable.Observable) {
        data.newValue.on(CHANGE, itemsChanged);
    }
    gridView.refresh();
}
function onItemTemplatePropertyChanged(data) {
    var gridView = data.object;
    gridView.refresh();
}
function onColWidthPropertyChanged(data) {
    var gridView = data.object;
    gridView.refresh();
}
function onRowHeightPropertyChanged(data) {
    var gridView = data.object;
    gridView.refresh();
}
function onSpacingPropertyChanged(data) {
    var gridView = data.object;
    gridView.refresh();
}
var GridView = (function (_super) {
    __extends(GridView, _super);
    function GridView() {
        var _this = _super.call(this) || this;
        _this._itemsChanged = function (args) { _this.refresh(); };
        return _this;
    }
    Object.defineProperty(GridView.prototype, "items", {
        get: function () {
            return this._getValue(GridView.itemsProperty);
        },
        set: function (value) {
            this._setValue(GridView.itemsProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridView.prototype, "itemTemplate", {
        get: function () {
            return this._getValue(GridView.itemTemplateProperty);
        },
        set: function (value) {
            this._setValue(GridView.itemTemplateProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridView.prototype, "colWidth", {
        get: function () {
            return this._getValue(GridView.colWidthProperty);
        },
        set: function (value) {
            this._setValue(GridView.colWidthProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridView.prototype, "rowHeight", {
        get: function () {
            return this._getValue(GridView.rowHeightProperty);
        },
        set: function (value) {
            this._setValue(GridView.rowHeightProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridView.prototype, "verticalSpacing", {
        get: function () {
            return this._getValue(GridView.verticalSpacingProperty);
        },
        set: function (value) {
            this._setValue(GridView.verticalSpacingProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GridView.prototype, "horizontalSpacing", {
        get: function () {
            return this._getValue(GridView.horizontalSpacingProperty);
        },
        set: function (value) {
            this._setValue(GridView.horizontalSpacingProperty, value);
        },
        enumerable: true,
        configurable: true
    });
    GridView.prototype._getItemTemplateContent = function () {
        var v;
        if (this.itemTemplate && this.items) {
            v = builder.parse(this.itemTemplate, this);
        }
        return v;
    };
    GridView.prototype._prepareItem = function (item, index) {
        if (item) {
            var dataItem = this._getDataItem(index);
            if (!(dataItem instanceof observable.Observable)) {
                item.bindingContext = null;
            }
            item.bindingContext = dataItem;
            item._inheritProperties(this);
        }
    };
    GridView.prototype._getDataItem = function (index) {
        return this.items.getItem ? this.items.getItem(index) : this.items[index];
    };
    return GridView;
}(view.View));
GridView.itemLoadingEvent = "itemLoading";
GridView.itemTapEvent = "itemTap";
GridView.loadMoreItemsEvent = "loadMoreItems";
GridView.itemsProperty = new dependencyObservable.Property("items", GRIDVIEW, new proxy.PropertyMetadata(undefined, dependencyObservable.PropertyMetadataSettings.AffectsLayout, onItemsPropertyChanged));
GridView.itemTemplateProperty = new dependencyObservable.Property("itemTemplate", GRIDVIEW, new proxy.PropertyMetadata(undefined, dependencyObservable.PropertyMetadataSettings.AffectsLayout, onItemTemplatePropertyChanged));
GridView.colWidthProperty = new dependencyObservable.Property("colWidth", GRIDVIEW, new proxy.PropertyMetadata(100, dependencyObservable.PropertyMetadataSettings.AffectsLayout, onColWidthPropertyChanged));
GridView.rowHeightProperty = new dependencyObservable.Property("rowHeight", GRIDVIEW, new proxy.PropertyMetadata(100, dependencyObservable.PropertyMetadataSettings.AffectsLayout, onRowHeightPropertyChanged));
GridView.verticalSpacingProperty = new dependencyObservable.Property("verticalSpacing", GRIDVIEW, new proxy.PropertyMetadata(10, dependencyObservable.PropertyMetadataSettings.AffectsLayout, onSpacingPropertyChanged));
GridView.horizontalSpacingProperty = new dependencyObservable.Property("horizontalSpacing", GRIDVIEW, new proxy.PropertyMetadata(10, dependencyObservable.PropertyMetadataSettings.AffectsLayout, onSpacingPropertyChanged));
exports.GridView = GridView;
