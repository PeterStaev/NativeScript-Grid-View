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
var view = require("ui/core/view");
var style = require("ui/styling/style");
var CELLIDENTIFIER = "gridcell";
var ITEMLOADING = common.GridView.itemLoadingEvent;
var LOADMOREITEMS = common.GridView.loadMoreItemsEvent;
var ITEMTAP = common.GridView.itemTapEvent;
global.moduleMerge(common, exports);
var GridViewCell = (function (_super) {
    __extends(GridViewCell, _super);
    function GridViewCell() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GridViewCell["new"] = function () {
        return _super["new"].call(this);
    };
    GridViewCell["class"] = function () {
        return GridViewCell;
    };
    return GridViewCell;
}(UICollectionViewCell));
function notifyForItemAtIndex(gridView, cell, eventName, indexPath) {
    var args = {
        eventName: eventName,
        object: gridView,
        index: indexPath.row,
        view: cell.view
    };
    gridView.notify(args);
    return args;
}
var GridViewDataSource = (function (_super) {
    __extends(GridViewDataSource, _super);
    function GridViewDataSource() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GridViewDataSource.initWithOwner = function (owner) {
        var dataSource = GridViewDataSource["new"]();
        dataSource._owner = owner;
        return dataSource;
    };
    GridViewDataSource.prototype.numberOfSectionsInCollectionView = function (collectionView) {
        return 1;
    };
    GridViewDataSource.prototype.collectionViewNumberOfItemsInSection = function (collectionView, section) {
        return this._owner.items ? this._owner.items.length : 0;
    };
    GridViewDataSource.prototype.collectionViewCellForItemAtIndexPath = function (collectionView, indexPath) {
        var cell = collectionView.dequeueReusableCellWithReuseIdentifierForIndexPath(CELLIDENTIFIER, indexPath) || GridViewCell["new"]();
        this._owner._prepareCell(cell, indexPath);
        var cellView = cell.view;
        if (cellView) {
            view.View.layoutChild(this._owner, cellView, 0, 0, this._owner.colWidth, this._owner.rowHeight);
        }
        return cell;
    };
    return GridViewDataSource;
}(NSObject));
GridViewDataSource.ObjCProtocols = [UICollectionViewDataSource];
var UICollectionViewDelegateImpl = (function (_super) {
    __extends(UICollectionViewDelegateImpl, _super);
    function UICollectionViewDelegateImpl() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    UICollectionViewDelegateImpl.initWithOwner = function (owner) {
        var delegate = UICollectionViewDelegateImpl["new"]();
        delegate._owner = owner;
        return delegate;
    };
    UICollectionViewDelegateImpl.prototype.collectionViewWillDisplayCellForItemAtIndexPath = function (collectionView, cell, indexPath) {
        if (indexPath.row === this._owner.items.length - 1) {
            this._owner.notify({ eventName: LOADMOREITEMS, object: this._owner });
        }
        if (cell.preservesSuperviewLayoutMargins) {
            cell.preservesSuperviewLayoutMargins = false;
        }
        if (cell.layoutMargins) {
            cell.layoutMargins = UIEdgeInsetsZero;
        }
    };
    UICollectionViewDelegateImpl.prototype.collectionViewDidSelectItemAtIndexPath = function (collectionView, indexPath) {
        var cell = collectionView.cellForItemAtIndexPath(indexPath);
        notifyForItemAtIndex(this._owner, cell, ITEMTAP, indexPath);
        cell.highlighted = false;
        return indexPath;
    };
    UICollectionViewDelegateImpl.prototype.collectionViewLayoutSizeForItemAtIndexPath = function (collectionView, collectionViewLayout, indexPath) {
        return CGSizeMake(this._owner.colWidth, this._owner.rowHeight);
    };
    return UICollectionViewDelegateImpl;
}(NSObject));
UICollectionViewDelegateImpl.ObjCProtocols = [UICollectionViewDelegate, UICollectionViewDelegateFlowLayout];
var GridView = (function (_super) {
    __extends(GridView, _super);
    function GridView() {
        var _this = _super.call(this) || this;
        _this._preparingCell = false;
        _this._layout = new UICollectionViewFlowLayout();
        _this._ios = UICollectionView.alloc().initWithFrameCollectionViewLayout(CGRectMake(0, 0, 0, 0), _this._layout);
        _this._ios.backgroundColor = utils.ios.getter(UIColor, UIColor.clearColor);
        _this._ios.registerClassForCellWithReuseIdentifier(GridViewCell["class"](), CELLIDENTIFIER);
        _this._ios.autoresizesSubviews = false;
        _this._ios.autoresizingMask = UIViewAutoresizing.UIViewAutoresizingNone;
        _this._dataSource = GridViewDataSource.initWithOwner(_this);
        _this._ios.dataSource = _this._dataSource;
        _this._delegate = UICollectionViewDelegateImpl.initWithOwner(_this);
        return _this;
    }
    GridView.prototype.onLoaded = function () {
        _super.prototype.onLoaded.call(this);
        this._ios.delegate = this._delegate;
    };
    GridView.prototype.onUnloaded = function () {
        this._ios.delegate = null;
        _super.prototype.onUnloaded.call(this);
    };
    Object.defineProperty(GridView.prototype, "ios", {
        get: function () {
            return this._ios;
        },
        enumerable: true,
        configurable: true
    });
    GridView.prototype.refresh = function () {
        this._ios.collectionViewLayout.minimumLineSpacing = this.verticalSpacing;
        this._ios.collectionViewLayout.minimumInteritemSpacing = this.horizontalSpacing;
        this._ios.reloadData();
        this.requestLayout();
    };
    GridView.prototype.requestLayout = function () {
        // When preparing cell don't call super - no need to invalidate our measure when cell desiredSize is changed.
        if (!this._preparingCell) {
            _super.prototype.requestLayout.call(this);
        }
    };
    GridView.prototype.measure = function (widthMeasureSpec, heightMeasureSpec) {
        var changed = this._setCurrentMeasureSpecs(widthMeasureSpec, heightMeasureSpec);
        _super.prototype.measure.call(this, widthMeasureSpec, heightMeasureSpec);
        if (changed) {
            this._ios.reloadData();
        }
    };
    GridView.prototype._layoutCell = function (cellView, index) {
        if (cellView) {
            var widthMeasureSpec = utils.layout.makeMeasureSpec(this.colWidth, utils.layout.EXACTLY), heightMeasureSpec = utils.layout.makeMeasureSpec(this.rowHeight, utils.layout.EXACTLY);
            view.View.measureChild(this, cellView, widthMeasureSpec, heightMeasureSpec);
        }
    };
    GridView.prototype._prepareCell = function (tableCell, indexPath) {
        var cell = tableCell;
        try {
            this._preparingCell = true;
            if (!cell.view) {
                cell.view = this._getItemTemplateContent();
            }
            notifyForItemAtIndex(this, cell, ITEMLOADING, indexPath);
            var view_1 = cell.view;
            if (view_1 && !view_1.parent && view_1.ios) {
                cell.contentView.addSubview(view_1.ios);
                this._addView(view_1);
            }
            this._prepareItem(view_1, indexPath.row);
            this._layoutCell(view_1, indexPath);
        }
        finally {
            this._preparingCell = false;
        }
    };
    return GridView;
}(common.GridView));
exports.GridView = GridView;
//#region Styling
var GridViewStyler = (function () {
    function GridViewStyler() {
    }
    GridViewStyler.setSectionInset = function (gridView, padding) {
        var flowLayout = gridView.ios.collectionViewLayout;
        var currentInset = flowLayout.sectionInset;
        flowLayout.sectionInset = {
            top: padding.top !== undefined ? padding.top : currentInset.top,
            right: padding.right !== undefined ? padding.right : currentInset.right,
            bottom: padding.bottom !== undefined ? padding.bottom : currentInset.bottom,
            left: padding.left !== undefined ? padding.left : currentInset.left
        };
    };
    //#region Padding Top Property
    GridViewStyler.setPaddingTop = function (gridView, newValue) {
        GridViewStyler.setSectionInset(gridView, { top: newValue });
    };
    GridViewStyler.resetPaddingTop = function (gridView, nativeValue) {
        GridViewStyler.setPaddingTop(gridView, nativeValue);
    };
    GridViewStyler.getNativePaddingTopValue = function (gridView) {
        return gridView.ios.collectionViewLayout.sectionInset.top;
    };
    //#endregion
    //#region Padding Right Property
    GridViewStyler.setPaddingRight = function (gridView, newValue) {
        GridViewStyler.setSectionInset(gridView, { right: newValue });
    };
    GridViewStyler.resetPaddingRight = function (gridView, nativeValue) {
        GridViewStyler.setPaddingRight(gridView, nativeValue);
    };
    GridViewStyler.getNativePaddingRightValue = function (gridView) {
        return gridView.ios.collectionViewLayout.sectionInset.right;
    };
    //#endregion
    //#region Padding Bottom Property
    GridViewStyler.setPaddingBottom = function (gridView, newValue) {
        GridViewStyler.setSectionInset(gridView, { bottom: newValue });
    };
    GridViewStyler.resetPaddingBottom = function (gridView, nativeValue) {
        GridViewStyler.setPaddingBottom(gridView, nativeValue);
    };
    GridViewStyler.getNativePaddingBottomValue = function (gridView) {
        return gridView.ios.collectionViewLayout.sectionInset.bottom;
    };
    //#endregion
    //#region Padding Left Property
    GridViewStyler.setPaddingLeft = function (gridView, newValue) {
        GridViewStyler.setSectionInset(gridView, { left: newValue });
    };
    GridViewStyler.resetPaddingLeft = function (gridView, nativeValue) {
        GridViewStyler.setPaddingLeft(gridView, nativeValue);
    };
    GridViewStyler.getNativePaddingLeftValue = function (gridView) {
        return gridView.ios.collectionViewLayout.sectionInset.left;
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
