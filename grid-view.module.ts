// External
import {
  NO_ERRORS_SCHEMA,
  NgModule,
} from "@angular/core";
import { NativeScriptModule } from "nativescript-angular/nativescript.module";

import { GridViewComponent } from "./ngx-grid-view-comp";

@NgModule({
  imports: [
    NativeScriptModule,
  ],
  declarations: [
    GridViewComponent,
  ],
  exports: [
    GridViewComponent,
  ],
  schemas: [
    NO_ERRORS_SCHEMA,
  ],
})
export class TNSGridViewModule {
}
