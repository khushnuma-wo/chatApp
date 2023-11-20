import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core'
import { NativeScriptFormsModule, NativeScriptModule } from '@nativescript/angular'

import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { StoreModule } from '@ngrx/store'
import { EffectsModule } from '@ngrx/effects'
import { userReducer } from "./state/reducers/user.reducer";
import { chatReducer } from "./state/reducers/chat.reducer";
import { UserEffects } from './state/effects/user.effect';
import { ChatEffects } from './state/effects/chat.effect';
import { UserService } from './services/user.service'
import { ChatService } from './services/chat.service'
import { ChatListService } from './services/chat-list.service'
import { ChatListEffects } from './state/effects/chat-list.effect'
import { chatListReducer } from './state/reducers/chat-list.reducer'

@NgModule({
  bootstrap: [AppComponent],
  imports: [NativeScriptModule,
     AppRoutingModule,
     NativeScriptFormsModule,
     StoreModule.forRoot({
      user: userReducer,
      chat: chatReducer,
      chatlist: chatListReducer
    }),
    EffectsModule.forRoot([UserEffects,ChatEffects,ChatListEffects]),
  ],
  declarations: [AppComponent],
  providers: [UserService,ChatService,ChatListService],
  schemas: [NO_ERRORS_SCHEMA],
})
export class AppModule {}
