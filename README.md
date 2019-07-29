**This repo only supports NativeScript pre-6.0. The latest version of the plugin supporting NS 6+ is availble as part of [ProPlugins](https://proplugins.org).**
# NativeScript GridView widget
[![Build Status](https://travis-ci.org/PeterStaev/NativeScript-Grid-View.svg?branch=master)](https://travis-ci.org/PeterStaev/NativeScript-Grid-View)
[![npm downloads](https://img.shields.io/npm/dm/nativescript-grid-view.svg)](https://www.npmjs.com/package/nativescript-grid-view)
[![npm downloads](https://img.shields.io/npm/dt/nativescript-grid-view.svg)](https://www.npmjs.com/package/nativescript-grid-view)
[![npm](https://img.shields.io/npm/v/nativescript-grid-view.svg)](https://www.npmjs.com/package/nativescript-grid-view)

A NativeScript GridView widget. The GridView displays data in separate cells, each cell representing one data item. For iOS wraps up [UICollectionView](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UICollectionView_class/) and for Android wraps up [RecyclerView](https://developer.android.com/reference/android/support/v7/widget/RecyclerView.html)

## Screenshot
![Screenshot of Android](https://raw.githubusercontent.com/PeterStaev/NativeScript-Grid-View/master/docs/screenshot.png)

## Installation
Run the following command from the root of your project:

`tns plugin add nativescript-grid-view`

This command automatically installs the necessary files, as well as stores nativescript-grid-view as a dependency in your project's package.json file.

## Configuration
There is no additional configuration needed!

## API

### Events
* **itemLoading**  
Triggered when generating an item in the GridView. 

* **itemTap**  
Triggered when the user taps on an item in the GridView. 

* **loadMoreItems**  
Triggered when the generated items reached the end of the items property.

* **scroll**  
Triggered when the GrdiView is scrolled by the user. from the `args` you can get the new horizonta/vertical offset.

### Static Properties
* **itemLoadingEvent** - *String*  
String value used when hooking to itemLoadingEvent event.

* **itemTapEvent** - *String*  
String value used when hooking to itemTapEvent event.

* **loadMoreItemsEvent** - *String*  
String value used when hooking to itemTapEvent event.

* **scrollEvent** - *String*  
String value used when hooking to scroll event.

### Instance Properties
* **ios** - *[UICollectionView](https://developer.apple.com/library/ios/documentation/UIKit/Reference/UICollectionView_class/)*  
Gets the native iOS view that represents the user interface for this component. Valid only when running on iOS.

* **android** - *[android.support.v7.widget.RecyclerView](https://developer.android.com/reference/android/support/v7/widget/RecyclerView.html)*  
Gets the native android widget that represents the user interface for this component. Valid only when running on Android OS.

* **items** - *Array | ItemsSource*  
Gets or sets the items collection of the GridView. The items property can be set to an array or an object defining length and getItem(index) method.

* **itemTemplate** - *String*  
Gets or sets the item template of the GridView.

* **rowHeight** - *PercentLength*  
Gets or sets the height for every row in the GridView.

* **colWidth** - *PercentLength*  
Gets or sets the width for every column in the GridView.

### Instance Methods
* **refresh()**  
Forces the GridView to reload all its items.

* **scrollToIndex(index: number, animated: boolean = true)**  
Scrolls the GridView to the item with the given index. This can be either animated or not. Defaults to animated.

## Usage
You need to add `xmlns:gv="nativescript-grid-view"` to your page tag, and then simply use `<gv:GridView/>` in order to add the widget to your page. Use `<gv:Gridview.itemTemplate/>` to specify the template for each cell:

```xml
<!-- test-page.xml -->
<Page xmlns="http://schemas.nativescript.org/tns.xsd" xmlns:gv="nativescript-grid-view" loaded="pageLoaded">
  <GridLayout>
    <gv:GridView items="{{ items }}" colWidth="24%" rowHeight="15%" padding="5" itemTap="gridViewItemTap" itemLoading="gridViewItemLoading" loadMoreItems="gridViewLoadMoreItems">
      <gv:GridView.itemTemplate>
        <GridLayout backgroundColor="#33ffff" style="margin: 5">
          <Label text="{{ value }}" verticalAlignment="center"/>
        </GridLayout>
      </gv:GridView.itemTemplate>
    </gv:GridView>
  </GridLayout>
</Page>
```

```ts
// test-page.ts
import { EventData, Observable } from "data/observable";
import { ObservableArray } from "data/observable-array";
import { Page } from "ui/page";

import { GridItemEventData } from "nativescript-grid-view";

let viewModel: Observable;

export function pageLoaded(args: EventData) {
    const page = args.object as Page;
    const items = new ObservableArray();

    for (let loop = 0; loop < 200; loop++) {
        items.push({ value: "test " + loop.toString() });
    }
    viewModel = new Observable();
    viewModel.set("items", items);

    page.bindingContext = viewModel;
}

export function gridViewItemTap(args: GridItemEventData) {
    console.log("tap index " + args.index.toString());
}

export function gridViewItemLoading(args: GridItemEventData) {
    console.log("item loading " + args.index.toString());
}

export function gridViewLoadMoreItems(args: EventData) {
    console.log("load more items");
}
```

You can also have multiple templates the same way you add them in the builtin `ListView` control:
```xml
<gv:GridView id="gv" row="0" class="{{ cssClass }}" items="{{ items }}" 
                colWidth="{{ colWidth }}" rowHeight="{{ rowHeight }}" itemTemplateSelector="templateSelector"
                itemTap="gridViewItemTap" itemLoading="gridViewItemLoading" loadMoreItems="gridViewLoadMoreItems">
    <gv:GridView.itemTemplates>
        <template key="odd">
            <GridLayout backgroundColor="#33ffff" style="margin: 10 10 0 0">
                <Label text="{{ value }}" verticalAlignment="center"/>
            </GridLayout>
        </template>

        <template key="even">
            <GridLayout backgroundColor="#33ffff" rows="auto, auto" style="margin: 10 10 0 0">
                <Label row="0" text="{{ value }}" verticalAlignment="center"/>
                <Label row="1" text="{{ value }}" verticalAlignment="center"/>
            </GridLayout>
        </template>
    </gv:GridView.itemTemplates>
</gv:GridView>
```
```ts
export function templateSelector(item: any, index: number, items: any) {
    return index % 2 === 0 ? "even" : "odd";
}
```

## Usage in Angular

Import `GridViewModule` in your `NgModule`:

```typescript
import { GridViewModule } from 'nativescript-grid-view/angular';

@NgModule({
    //......
    imports: [
        //......
        GridViewModule,
        //......
    ],
    //......
})
```

#### Example Usage
```ts
// app.module.ts
import { GridViewModule } from "nativescript-grid-view/angular";

@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        NativeScriptModule,
        AppRoutingModule,
        GridViewModule,
    ],
    declarations: [
        AppComponent,
        ItemsComponent,
        ItemDetailComponent
    ],
    providers: [
        ItemService
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
export class AppModule { }
```

```html
<!-- my.component.html -->
<GridLayout class="page">
  <GridView [items]="items" colWidth="30%" rowHeight="100">
    <ng-template let-item="item" let-odd="odd">
      <StackLayout margin="10" [nsRouterLink]="['/item', item.id]" borderColor="blue" borderWidth="2" borderRadius="5" verticalAlignment="stretch" class="list-group-item" [class.odd]="odd">
        <Label verticalAlignment="center" [text]="item.name" class="list-group-item-text" textWrap="true"></Label>
      </StackLayout>
    </ng-template>
  </GridView>
</GridLayout>
```

If you want to use multiple item templates, you can do that very similarly to how you do it for the builtin `ListView` control.
```html
<GridView row="1" [items]="items" colWidth="33%" rowHeight="100" [itemTemplateSelector]="templateSelector">
    <ng-template nsTemplateKey="Defender" let-item="item" let-odd="odd">
        <StackLayout [nsRouterLink]="['/item', item.id]" borderColor="blue" borderWidth="2" borderRadius="5" verticalAlignment="stretch" class="list-group-item" [class.odd]="odd">
        <Label verticalAlignment="center" [text]="item.name" class="list-group-item-text" textWrap="true"></Label>
        </StackLayout>
    </ng-template>

    <ng-template nsTemplateKey="Goalkeeper" let-item="item" let-odd="odd">
        <StackLayout [nsRouterLink]="['/item', item.id]" borderColor="black" borderWidth="2" borderRadius="5" verticalAlignment="stretch" class="list-group-item" [class.odd]="odd">
        <Label verticalAlignment="center" [text]="item.name" class="list-group-item-text" textWrap="true"></Label>
        </StackLayout>
    </ng-template>

    <ng-template nsTemplateKey="Midfielder" let-item="item" let-odd="odd">
        <StackLayout [nsRouterLink]="['/item', item.id]" borderColor="yellow" borderWidth="2" borderRadius="5" verticalAlignment="stretch" class="list-group-item" [class.odd]="odd">
        <Label verticalAlignment="center" [text]="item.name" class="list-group-item-text" textWrap="true"></Label>
        </StackLayout>
    </ng-template>

    <ng-template nsTemplateKey="Forward" let-item="item" let-odd="odd">
        <StackLayout [nsRouterLink]="['/item', item.id]" borderColor="red" borderWidth="2" borderRadius="5" verticalAlignment="stretch" class="list-group-item" [class.odd]="odd">
        <Label verticalAlignment="center" [text]="item.name" class="list-group-item-text" textWrap="true"></Label>
        </StackLayout>
    </ng-template>
</GridView>
```

## Demos
This repository includes both Angular and plain NativeScript demos. In order to run those execute the following in your shell:
```shell
$ git clone https://github.com/peterstaev/nativescript-grid-view
$ cd nativescript-grid-view
$ npm install
$ npm run demo-ios
```
This will run the plain NativeScript demo project on iOS. If you want to run it on Android simply use the `-android` instead of the `-ios` sufix. 

If you want to run the Angular demo simply use the `demo-ng-` prefix instead of `demo-`. 

## Donate
[![Donate](https://img.shields.io/badge/paypal-donate-brightgreen.svg)](https://bit.ly/2AS9QKB)

`bitcoin:14fjysmpwLvSsAskvLASw6ek5XfhTzskHC`

![Donate](https://www.tangrainc.com/qr.png)
