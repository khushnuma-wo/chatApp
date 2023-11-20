import {NgModule, NO_ERRORS_SCHEMA} from "@angular/core";
import {NativeScriptCommonModule, NativeScriptFormsModule} from "@nativescript/angular";
import {Routes} from "@angular/router";
import {NativeScriptRouterModule} from "@nativescript/angular";
import { ChatListComponent } from "../chat-list/chat-list.component";

const routes: Routes = [
  {path: "", component: ChatListComponent},
];

@NgModule({
  imports: [
    NativeScriptCommonModule,
    NativeScriptFormsModule,
    NativeScriptRouterModule.forChild(routes)
  ],
  declarations: [
    ChatListComponent
  ],
  schemas: [NO_ERRORS_SCHEMA]
})
export class ChatListModule {
}
