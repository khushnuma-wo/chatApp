import { NgModule } from '@angular/core'
import { Routes } from '@angular/router'
import { NativeScriptRouterModule } from '@nativescript/angular'

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: "signup", loadChildren: () => import("./auth/signup/signup.module").then(m => m.SignupModule) },
  { path: "login", loadChildren: () => import("./auth/login/login.module").then(m => m.LoginModule) },
  { path: "home", loadChildren: () => import("./home/home.module").then(m => m.HomeModule) },
  { path: "chat/:userId/:conversationId", loadChildren: () => import("./chat/chat.module").then(m => m.ChatModule) },
  { path: "chat-list", loadChildren: () => import("./chat-list/chat-list.module").then(m => m.ChatListModule) },
  { path: "forgot-password", loadChildren: () => import("./auth/forgot-password/forgot-password.module").then(m => m.ForgotPasswordModule) },
]

@NgModule({
  imports: [NativeScriptRouterModule.forRoot(routes)],
  exports: [NativeScriptRouterModule],
})
export class AppRoutingModule {}
