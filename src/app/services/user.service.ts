import { Injectable } from "@angular/core";
import { ApplicationSettings } from "@nativescript/core";
import { firebase } from '@nativescript/firebase-core';
import '@nativescript/firebase-firestore';
import '@nativescript/firebase-auth';
import { Observable, from, map } from "rxjs";

@Injectable()
export class UserService {
  private currentUser: any;
  private isAuthenticated: boolean = false;
  constructor() {
    this.loadUserState();
  }

  async signup(name: string, email: string, password: string) {
    try {
      const authResult = await firebase().auth().createUserWithEmailAndPassword(email, password);
      const userUid = authResult.user.uid;
      await firebase().firestore().collection('users').doc(userUid)
        .set({
          userUid,
          name: name,
          email: email,
          displayName: name
        })

      this.currentUser = authResult;
      this.isAuthenticated = true;

      ApplicationSettings.setString("currentUser", JSON.stringify(authResult));
    } catch (error) {
      console.log("User creation error:", error);
      throw error;
    }
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      const authResult = await firebase().auth().signInWithEmailAndPassword(email, password)
      console.log(authResult, "authResult")
      this.currentUser = authResult;
      this.isAuthenticated = true;
      ApplicationSettings.setString("currentUser", JSON.stringify(authResult));
      // console.log('User logged in:', this.currentUser);
      return true;
    } catch (error) {
      console.log("Login error:", error);
      throw error;
    }
  }
  async logout(): Promise<void> {
    try {
      await firebase().auth().signOut();
      this.currentUser = null;
      this.isAuthenticated = false;
      ApplicationSettings.remove("currentUser");
    } catch (error) {
      console.log("Logout error:", error);
      throw error;
    }
  }
  getSingleUser(userUid: string): Promise<any> {
    return firebase().firestore().collection('users').doc(userUid).get()
      .then((doc) => {
        if (doc.exists) {
          return doc.data();
        } else {
          return null;
        }
      })
      .catch((error) => {
        throw error;
      });
  }

  async getUserById(userId: string): Promise<any> {
    try {
      const userDoc = await firebase().firestore().collection('users').doc(userId).get();
      if (userDoc.exists) {
        return userDoc.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error(`Error fetching user with ID ${userId}:`, error);
      throw error;
    }
  }
  
  async signUpWithGoogle(): Promise<void> {
    try {
      // const provider = new GoogleAuthProvider();
      // await firebase().auth().signInWithCustomToken(user).then((res)=> {
      //  const userUid : any = res.user?.uid || null;
      //  const user = {
      //    name: res.user?.displayName,
      //    email:res.user?.email,
      //    userUid: userUid
      //  }
      //   firebase().firestore().collection("users").doc(user.userUid).set(user);
      //   ApplicationSettings.setString("currentUser", JSON.stringify(user));
      // })
      //     // GoogleSignin.configure(); 
      //     // const googleSignInResult = await GoogleAuthProvider.();

      //     // if (googleSignInResult) {
      //     //   const user = {
      //     //     userUid: googleSignInResult.idToken,
      //     //     name: googleSignInResult.displayName,
      //     //     email: googleSignInResult.email,
      //     //   };
      //     //   console.log('User:', user);

      //     //   await firebase().firestore().collection("users").doc(user.userUid).set(user);
      //     //   ApplicationSettings.setString("currentUser", JSON.stringify(user));
      //     // } else {
      //     //   console.log('Google Sign-In was canceled.');
      //     // } 
    } catch (error) {
      console.error("Google Sign-In error:", error);
      throw error;
    }
  }
  async getAllUsers() {
    try {
      const querySnapshot = await firebase().firestore().collection('users').get();

      const allUsers = querySnapshot.docs.map((doc) => doc.data());
      const currentUser = await this.getCurrentUser();
      if (currentUser) {
        const currentUserId = currentUser.uid;
        return allUsers.filter((user) => user.userUid !== currentUserId);
      }
      return allUsers;
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    return this.currentUser;
  }
  isAuthenticatedUser(): boolean {
    return this.isAuthenticated;
  }

  private loadUserState() {
    const storedUser = ApplicationSettings.getString("currentUser", null);
    if (storedUser) {
      this.currentUser = JSON.parse(storedUser);
      if (this.currentUser && this.currentUser.uid) {
        this.isAuthenticated = true;
      }
    }
  }
  sendPasswordResetLink(email: string): Observable<any> {
    return from(firebase().auth().sendPasswordResetEmail(email));
  }
}