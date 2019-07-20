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

import { EventData, Observable } from "tns-core-modules/data/observable";
import { KeyedTemplate, Length, View } from "tns-core-modules/ui/core/view";
import * as utils from "tns-core-modules/utils/utils";

import {
    GridViewBase,
    itemTemplatesProperty,
    orientationProperty,
    paddingBottomProperty,
    paddingLeftProperty,
    paddingRightProperty,
    paddingTopProperty,
} from "./grid-view-common";

import { GridItemEventData, Orientation, ScrollEventData } from ".";

export * from "./grid-view-common";

export class GridView extends GridViewBase {
    private _layout: UICollectionViewFlowLayout;
    private _dataSource: GridViewDataSource;
    private _delegate: UICollectionViewDelegateImpl;
    private _preparingCell: boolean = false;
    private _map: Map<GridViewCell, View>;

    constructor() {
        super();

        this._map = new Map<GridViewCell, View>();
    }

    public createNativeView() {
        this._layout = UICollectionViewFlowLayout.alloc().init();
        this._layout.minimumLineSpacing = 0;
        this._layout.minimumInteritemSpacing = 0;

        return UICollectionView.alloc().initWithFrameCollectionViewLayout(CGRectMake(0, 0, 0, 0), this._layout);
    }

    public initNativeView() {
        super.initNativeView();

        const nativeView: UICollectionView = this.nativeViewProtected;
        nativeView.backgroundColor = utils.ios.getter(UIColor, UIColor.clearColor);
        nativeView.registerClassForCellWithReuseIdentifier(GridViewCell.class(), this._defaultTemplate.key);
        nativeView.autoresizesSubviews = false;
        nativeView.autoresizingMask = UIViewAutoresizing.None;

        this._dataSource = GridViewDataSource.initWithOwner(new WeakRef(this));
        nativeView.dataSource = this._dataSource;

        this._delegate = UICollectionViewDelegateImpl.initWithOwner(new WeakRef(this));
        this._setNativeClipToBounds();

        // These are needed in cases where the native view is inited after the property has been set
        // For example happens with Angular usage. 
        this._updateColWidthProperty();
        this._updateRowHeightProperty();
    }

    public disposeNativeView() {
        this._layout = null;
        this._delegate = null;
        this._dataSource = null;
        super.disposeNativeView();
    }

    public onLoaded() {
        super.onLoaded();
        this.ios.delegate = this._delegate;
    }

    public onUnloaded() {
        this.ios.delegate = null;
        super.onUnloaded();
    }

    get ios(): UICollectionView {
        return this.nativeViewProtected;
    }

    get _childrenCount(): number {
        return this._map.size;
    }

    get horizontalOffset(): number {
        return this.nativeViewProtected.contentOffset.x;
    }

    get verticalOffset(): number {
        return this.nativeViewProtected.contentOffset.y;
    }

    public [paddingTopProperty.getDefault](): number {
        return this._layout.sectionInset.top;
    }
    public [paddingTopProperty.setNative](value: Length) {
        this._setPadding({ top: utils.layout.toDeviceIndependentPixels(this.effectivePaddingTop) });
    }

    public [paddingRightProperty.getDefault](): number {
        return this._layout.sectionInset.right;
    }
    public [paddingRightProperty.setNative](value: Length) {
        this._setPadding({ right: utils.layout.toDeviceIndependentPixels(this.effectivePaddingRight) });
    }

    public [paddingBottomProperty.getDefault](): number {
        return this._layout.sectionInset.bottom;
    }
    public [paddingBottomProperty.setNative](value: Length) {
        this._setPadding({ bottom: utils.layout.toDeviceIndependentPixels(this.effectivePaddingBottom) });
    }

    public [paddingLeftProperty.getDefault](): number {
        return this._layout.sectionInset.left;
    }
    public [paddingLeftProperty.setNative](value: Length) {
        this._setPadding({ left: utils.layout.toDeviceIndependentPixels(this.effectivePaddingLeft) });
    }

    public [orientationProperty.getDefault](): Orientation {
        if (this._layout.scrollDirection === UICollectionViewScrollDirection.Horizontal) {
            return "horizontal";
        }

        return "vertical";
    }
    public [orientationProperty.setNative](value: Orientation) {
        if (value === "horizontal") {
            this._layout.scrollDirection = UICollectionViewScrollDirection.Horizontal;
        } else {
            this._layout.scrollDirection = UICollectionViewScrollDirection.Vertical;
        }
    }

    public [itemTemplatesProperty.getDefault](): KeyedTemplate[] {
        return null;
    }
    public [itemTemplatesProperty.setNative](value: KeyedTemplate[]) {
        this._itemTemplatesInternal = new Array<KeyedTemplate>(this._defaultTemplate);
        if (value) {
            for (const template of value) {
                this.ios.registerClassForCellWithReuseIdentifier(GridViewCell.class(), template.key);
            }

            this._itemTemplatesInternal = this._itemTemplatesInternal.concat(value);
        }

        this.refresh();
    }

    public eachChildView(callback: (child: View) => boolean): void {
        this._map.forEach((view, key) => {
            callback(view);
        });
    }

    public onLayout(left: number, top: number, right: number, bottom: number) {
        super.onLayout(left, top, right, bottom);

        const layout = this.ios.collectionViewLayout as UICollectionViewFlowLayout;
        layout.itemSize = CGSizeMake(utils.layout.toDeviceIndependentPixels(this._effectiveColWidth), utils.layout.toDeviceIndependentPixels(this._effectiveRowHeight));

        this._map.forEach((childView, listViewCell) => {
            childView.iosOverflowSafeAreaEnabled = false;
            View.layoutChild(this, childView, 0, 0, this._effectiveColWidth, this._effectiveRowHeight);
        });
    }

    public refresh() {
        // clear bindingContext when it is not observable because otherwise bindings to items won't reevaluate
        this.eachChildView((view) => {
            if (!(view.bindingContext instanceof Observable)) {
                view.bindingContext = null;
            }

            return true;
        });

        if (this.isLoaded) {
            this.ios.reloadData();
            this.requestLayout();
        }
    }

    public scrollToIndex(index: number, animated: boolean = true) {
        this.ios.scrollToItemAtIndexPathAtScrollPositionAnimated(
            NSIndexPath.indexPathForItemInSection(index, 0),
            this.orientation === "vertical" ? UICollectionViewScrollPosition.Top : UICollectionViewScrollPosition.Left,
            animated,
        );
    }

    public requestLayout(): void {
        // When preparing cell don't call super - no need to invalidate our measure when cell desiredSize is changed.
        if (!this._preparingCell) {
            super.requestLayout();
        }
    }

    public measure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        const changed = (this as any)._setCurrentMeasureSpecs(widthMeasureSpec, heightMeasureSpec);
        super.measure(widthMeasureSpec, heightMeasureSpec);
        if (changed) {
            this.ios.reloadData();
        }
    }
    public onMeasure(widthMeasureSpec: number, heightMeasureSpec: number): void {
        super.onMeasure(widthMeasureSpec, heightMeasureSpec);

        this._map.forEach((childView: any, gridViewCell) => {
            View.measureChild(this, childView, childView._currentWidthMeasureSpec, childView._currentHeightMeasureSpec);
        });
    }

    public _setNativeClipToBounds() {
        this.ios.clipsToBounds = true;
    }

    public _removeContainer(cell: GridViewCell): void {
        const view = cell.view;

        view.parent._removeView(view);
        this._map.delete(cell);
    }

    public _prepareCell(cell: GridViewCell, indexPath: NSIndexPath) {
        try {
            this._preparingCell = true;

            let view = cell.view;
            if (!view) {
                view = this._getItemTemplate(indexPath.row).createView();
            }

            const args: GridItemEventData = {
                eventName: GridViewBase.itemLoadingEvent,
                object: this,
                index: indexPath.row,
                view,
                ios: cell,
                android: undefined,
            };
            this.notify(args);

            // Get the view as some listener to the itemLoading event could have changed it
            // For example the angular component does this when it is a single template. 
            view = args.view;

            // If cell is reused it have old content - remove it first.
            if (!cell.view) {
                cell.owner = new WeakRef(view);
            }
            else if (cell.view !== view) {
                this._removeContainer(cell);
                (cell.view.nativeView as UIView).removeFromSuperview();
                cell.owner = new WeakRef(view);
            }

            this._prepareItem(view, indexPath.row);
            this._map.set(cell, view);

            if (view && !view.parent) {
                this._addView(view);
                cell.contentView.addSubview(view.ios);
            }

            this._layoutCell(view, indexPath);
        }
        finally {
            this._preparingCell = false;
        }
    }

    private _layoutCell(cellView: View, index: NSIndexPath) {
        if (cellView) {
            const widthMeasureSpec = utils.layout.makeMeasureSpec(this._effectiveColWidth, utils.layout.EXACTLY);
            const heightMeasureSpec = utils.layout.makeMeasureSpec(this._effectiveRowHeight, utils.layout.EXACTLY);

            View.measureChild(this, cellView, widthMeasureSpec, heightMeasureSpec);
        }
    }

    private _setPadding(newPadding: { top?: number, right?: number, bottom?: number, left?: number }) {
        const padding = {
            top: this._layout.sectionInset.top,
            right: this._layout.sectionInset.right,
            bottom: this._layout.sectionInset.bottom,
            left: this._layout.sectionInset.left
        };
        // tslint:disable-next-line:prefer-object-spread
        const newValue = Object.assign(padding, newPadding);
        this._layout.sectionInset =
            UIEdgeInsetsFromString(`{${newValue.top},${newValue.left},${newValue.bottom},${newValue.right}}`);
    }
}

class GridViewCell extends UICollectionViewCell {
    public static new(): GridViewCell {
        return super.new() as GridViewCell;
    }
    public static class(): any {
        return GridViewCell;
    }

    public owner: WeakRef<View>;

    get view(): View {
        return this.owner ? this.owner.get() : null;
    }

    public willMoveToSuperview(newSuperview: UIView): void {
        const parent = (this.view ? this.view.parent : null) as GridView;

        // When inside GidView and there is no newSuperview this cell is 
        // removed from native visual tree so we remove it from our tree too.
        if (parent && !newSuperview) {
            parent._removeContainer(this);
        }
    }
}

@ObjCClass(UICollectionViewDataSource)
class GridViewDataSource extends NSObject implements UICollectionViewDataSource {
    public static initWithOwner(owner: WeakRef<GridView>): GridViewDataSource {
        const dataSource = GridViewDataSource.new() as GridViewDataSource;
        dataSource._owner = owner;
        return dataSource;
    }

    private _owner: WeakRef<GridView>;

    public numberOfSectionsInCollectionView(collectionView: UICollectionView) {
        return 1;
    }

    public collectionViewNumberOfItemsInSection(collectionView: UICollectionView, section: number) {
        const owner = this._owner.get();
        return owner.items ? owner.items.length : 0;
    }

    public collectionViewCellForItemAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath): UICollectionViewCell {
        const owner = this._owner.get();
        const template = owner._getItemTemplate(indexPath.row);
        const cell: any = collectionView.dequeueReusableCellWithReuseIdentifierForIndexPath(template.key, indexPath) || GridViewCell.new();

        owner._prepareCell(cell, indexPath);

        const cellView: View = cell.view;
        if (cellView && (cellView as any).isLayoutRequired) {
            cellView.iosOverflowSafeAreaEnabled = false;
            View.layoutChild(owner, cellView, 0, 0, owner._effectiveColWidth, owner._effectiveRowHeight);
        }

        return cell;
    }
}

@ObjCClass(UICollectionViewDelegate, UICollectionViewDelegateFlowLayout)
class UICollectionViewDelegateImpl extends NSObject implements UICollectionViewDelegate, UICollectionViewDelegateFlowLayout {
    public static initWithOwner(owner: WeakRef<GridView>): UICollectionViewDelegateImpl {
        const delegate = UICollectionViewDelegateImpl.new() as UICollectionViewDelegateImpl;
        delegate._owner = owner;
        return delegate;
    }

    private _owner: WeakRef<GridView>;

    public collectionViewWillDisplayCellForItemAtIndexPath(collectionView: UICollectionView, cell: UICollectionViewCell, indexPath: NSIndexPath) {
        const owner = this._owner.get();

        if (indexPath.row === owner.items.length - 1) {
            owner.notify<EventData>({
                eventName: GridViewBase.loadMoreItemsEvent,
                object: owner
            });
        }

        if (cell.preservesSuperviewLayoutMargins) {
            cell.preservesSuperviewLayoutMargins = false;
        }

        if (cell.layoutMargins) {
            cell.layoutMargins = UIEdgeInsetsZero;
        }
    }

    public collectionViewDidSelectItemAtIndexPath(collectionView: UICollectionView, indexPath: NSIndexPath) {
        const cell = collectionView.cellForItemAtIndexPath(indexPath);
        const owner = this._owner.get();

        owner.notify<GridItemEventData>({
            eventName: GridViewBase.itemTapEvent,
            object: owner,
            index: indexPath.row,
            view: (cell as GridViewCell).view,
            ios: cell,
            android: undefined,
        });

        cell.highlighted = false;

        return indexPath;
    }

    public scrollViewDidScroll(collectionView: UICollectionView) {
        const owner = this._owner.get();
        owner.notify<ScrollEventData>({
            object: owner,
            eventName: GridViewBase.scrollEvent,
            scrollX: owner.horizontalOffset,
            scrollY: owner.verticalOffset
        });
    }
}
