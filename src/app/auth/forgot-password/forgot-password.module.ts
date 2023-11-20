import {NgModule, NO_ERRORS_SCHEMA} from "@angular/core";
import {NativeScriptCommonModule, NativeScriptFormsModule} from "@nativescript/angular";
import { Routes } from "@angular/router";
import { NativeScriptRouterModule } from "@nativescript/angular";
import {ForgotPasswordComponent} from "./forgot-password.component";

const routes: Routes = [
  { path: "", component: ForgotPasswordComponent }
];

@NgModule({
  imports: [
    NativeScriptCommonModule,
    NativeScriptFormsModule,
    NativeScriptRouterModule.forChild(routes)
  ],
  declarations: [
    ForgotPasswordComponent
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class ForgotPasswordModule { }
