import { Injectable } from '@angular/core';
import { firebase } from '@nativescript/firebase-core';
import '@nativescript/firebase-firestore';
import { Observable, catchError, from, map, throwError } from 'rxjs';
import { Message } from '../state/class/message.class';
import '@nativescript/firebase-storage';
import { UserService } from './user.service';

@Injectable()
export class ChatService {
  constructor(private userService : UserService) { }
  sendMessage(senderId: string, receiverId: string, message: string, imagePath?: string): Observable<void> {
    const timestamp = new Date().toISOString();
    const messageData: Message = {
      senderId,
      receiverId,
      message,
      timestamp,
      isLoggedIn: true,
      seen: false
    };

    const messageID = firebase().firestore().collection('messages').doc().id;

    const senderPath = `users/${senderId}/messages/${messageID}`;
    const receiverPath = `users/${receiverId}/messages/${messageID}`;

    const batch = firebase().firestore().batch();
    batch.set(firebase().firestore().doc(senderPath), messageData);
    batch.set(firebase().firestore().doc(receiverPath), { ...messageData, isLoggedIn: false });

    return new Observable<void>((observer) => {
      batch.commit()
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  async uploadImage(imagePath: string): Promise<string | null> {
    const currentUser = await this.userService.getCurrentUser();
    const userId = currentUser.user.uid;
    const filename = `${userId}_${Date.now()}.jpg`; 
  
    const storageRef = firebase().storage().ref().child(`images/${filename}`);
  
    try {
      const result = await storageRef.putFile(imagePath);
      
      const downloadUrl = await storageRef.getDownloadURL();
  
      return downloadUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  }
  

  fetchMessages(senderId: string, receiverId: string): Observable<Message[]> {
    const messagesRef = firebase().firestore().collection('users').doc(senderId).collection('messages');

    return from(
      messagesRef
        .where('senderId', 'in', [senderId, receiverId])
        .where('receiverId', 'in', [senderId, receiverId])
        .get()
    ).pipe(
      map((querySnapshot) => {
        const messages: Message[] = [];
        querySnapshot.forEach((doc) => {
          messages.push(doc.data() as Message);
        });
        // console.log('service', messages);
        return messages;
      }),
      catchError((error) => {
        return throwError(error);
      })
    );
  }
}
