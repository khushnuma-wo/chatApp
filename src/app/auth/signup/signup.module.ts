import {NgModule, NO_ERRORS_SCHEMA} from "@angular/core";
import {NativeScriptCommonModule, NativeScriptFormsModule} from "@nativescript/angular";
import {Routes} from "@angular/router";
import {NativeScriptRouterModule} from "@nativescript/angular";
import {SignupComponent} from "./signup.component";

const routes: Routes = [
  {path: "", component: SignupComponent}
];

@NgModule({
  imports: [
    NativeScriptCommonModule,
    NativeScriptFormsModule,
    NativeScriptRouterModule.forChild(routes)
  ],
  declarations: [
    SignupComponent
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class SignupModule {
}
