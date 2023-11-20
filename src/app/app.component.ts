import { Component, OnInit } from '@angular/core';
import { RouterExtensions } from '@nativescript/angular';
import { firebase } from '@nativescript/firebase-core';
import { UserService } from './services/user.service';
import '@nativescript/firebase-firestore';
import { GoogleSignin } from '@nativescript/google-signin';

@Component({
  selector: 'ns-app',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  constructor(private routerExtensions: RouterExtensions,private userService: UserService){}
  async ngOnInit() {
    try {
      const defaultApp = await firebase().initializeApp();
      this.handleAuthenticationState();
      // console.log(defaultApp);
    } catch (error) {
      console.error('Firebase initialization error:', error);
    }
  }

  async handleAuthenticationState() {
    const currentUser = await this.userService.getCurrentUser();
    // console.log('currentUser',currentUser);
    
    if (!currentUser) {
      this.routerExtensions.navigate(['/login'], {
        clearHistory: true, 
        animated: false,
      });
    }
  }
}