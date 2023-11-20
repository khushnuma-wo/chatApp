import {NgModule, NO_ERRORS_SCHEMA} from "@angular/core";
import {NativeScriptCommonModule, NativeScriptFormsModule} from "@nativescript/angular";
import {Routes} from "@angular/router";
import {NativeScriptRouterModule} from "@nativescript/angular";
import { ChatComponent } from "./chat.component";

const routes: Routes = [
  {path: "", component: ChatComponent},
];

@NgModule({
  imports: [
    NativeScriptCommonModule,
    NativeScriptFormsModule,
    NativeScriptRouterModule.forChild(routes)
  ],
  declarations: [
    ChatComponent
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class ChatModule {
}
