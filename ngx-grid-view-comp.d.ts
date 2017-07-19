import { AfterContentInit, AfterViewInit, ChangeDetectorRef, DoCheck, ElementRef, EmbeddedViewRef, EventEmitter, IterableDiffers, OnDestroy, TemplateRef, ViewContainerRef } from "@angular/core";
import { View } from "tns-core-modules/ui/core/view";
import { GridItemEventData, GridView } from "./grid-view";
export declare const gridViewTraceCategory = "ns-grid-view";
export declare function gridViewLog(message: string): void;
export declare function listViewError(message: string): void;
export declare class GridItemContext {
    $implicit: any;
    item: any;
    index: number;
    even: boolean;
    odd: boolean;
    constructor($implicit?: any, item?: any, index?: number, even?: boolean, odd?: boolean);
}
export interface SetupGridViewArgs {
    view: EmbeddedViewRef<any>;
    data: any;
    index: number;
    context: GridItemContext;
}
export declare class GridViewComponent implements DoCheck, OnDestroy, AfterContentInit, AfterViewInit {
    private _iterableDiffers;
    private _cdr;
    readonly nativeElement: GridView;
    loader: ViewContainerRef;
    setupGridView: EventEmitter<SetupGridViewArgs>;
    itemTemplateQuery: TemplateRef<GridItemContext>;
    items: any;
    private gridView;
    private _items;
    private _differ;
    private itemTemplate;
    constructor(_elementRef: ElementRef, _iterableDiffers: IterableDiffers, _cdr: ChangeDetectorRef);
    ngAfterContentInit(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    ngDoCheck(): void;
    onItemLoading(args: GridItemEventData): void;
    setupViewRef(view: EmbeddedViewRef<GridItemContext>, data: any, index: number): void;
    private setItemTemplates();
    private detectChangesOnChild(viewRef, index);
    private refresh();
}
export interface ComponentView {
    rootNodes: any[];
    destroy(): void;
}
export declare type RootLocator = (nodes: any[], nestLevel: number) => View;
export declare function getGridItemRoot(viewRef: ComponentView, rootLocator?: RootLocator): View;
