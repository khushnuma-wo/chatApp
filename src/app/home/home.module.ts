import {NgModule, NO_ERRORS_SCHEMA} from "@angular/core";
import {NativeScriptCommonModule, NativeScriptFormsModule} from "@nativescript/angular";
import {Routes} from "@angular/router";
import {NativeScriptRouterModule} from "@nativescript/angular";
import { HomeComponent } from "./home.component";

const routes: Routes = [
  {path: "", component: HomeComponent}
];

@NgModule({
  imports: [
    NativeScriptCommonModule,
    NativeScriptFormsModule,
    NativeScriptRouterModule.forChild(routes)
  ],
  declarations: [
    HomeComponent
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class HomeModule {
}
