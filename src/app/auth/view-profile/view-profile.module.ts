import {NgModule, NO_ERRORS_SCHEMA} from "@angular/core";
import {NativeScriptCommonModule, NativeScriptFormsModule} from "@nativescript/angular";
import {Routes} from "@angular/router";
import {NativeScriptRouterModule} from "@nativescript/angular";
import { ViewProfileComponent } from "./view-profile.component";

const routes: Routes = [
  {path: "", component: ViewProfileComponent}
];

@NgModule({
  imports: [
    NativeScriptCommonModule,
    NativeScriptFormsModule,
    NativeScriptRouterModule.forChild(routes)
  ],
  declarations: [
    ViewProfileComponent
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class ViewProfileModule {
}
