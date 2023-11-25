import { Injectable } from '@angular/core';
import { firebase } from '@nativescript/firebase-core';
import '@nativescript/firebase-firestore';
import { Observable, Subject, catchError, finalize, from, map, throwError } from 'rxjs';
import { Message } from '../state/class/message.class';
import '@nativescript/firebase-storage';
import { UserService } from './user.service';

@Injectable()
export class ChatService {
  constructor(private userService: UserService) { }
  sendMessage(senderId: string, receiverId: string, message: string, imageUrls?: any): Observable<void> {
    const timestamp = new Date().toISOString();
    const messageData: Message = {
      senderId,
      receiverId,
      message,
      timestamp,
      isLoggedIn: true,
      seen: false,
      imageUrls
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

  async uploadImage(imagePath: string) {
    const currentUser = await this.userService.getCurrentUser();
    const userId = currentUser.user.uid;
    const filename = `${userId}_${Date.now()}.jpg`;
    const storageRef = firebase().storage().ref(`images/${filename}`);
    storageRef.putFile(imagePath);
    return storageRef['fullPath'];
  }

  async getImageDownloadUrl(finalPath) {
    try {
      const url = await firebase().storage().ref(finalPath).getDownloadURL();
      console.log("URL---->", url)
      return url;
    } catch (error) {
      console.log("error", error)
      switch (error.code) {
        case "storage/object-not-found":
          return "res://img_placeholder";
        case "storage/unauthorized":
        case "storage/canceled":
          break;
        case "storage/unknown":
          break;
        default:
          return 'res://img_placeholder'
      }
      return 'res://img_placeholder'
    }
  }

  fetchMessages(senderId: string, receiverId: string): Observable<Message[]> {
    const messagesRef = firebase().firestore().collection('users').doc(senderId).collection('messages');
  
    const messagesSubject = new Subject<Message[]>();
  
    const unsubscribe = messagesRef
      .where('senderId', 'in', [senderId, receiverId])
      .where('receiverId', 'in', [senderId, receiverId])
      .onSnapshot(
        (querySnapshot) => {
          const messages: Message[] = [];
          querySnapshot.forEach((doc) => {
            const data = {
              ...doc.data() as Message,
              id: doc.id
            };
            messages.push(data);
          });
          messagesSubject.next(messages);
        },
        (error) => {
          messagesSubject.error(error);
        }
      );
  
    return messagesSubject.asObservable().pipe(
      catchError((error) => {
        console.error('Error fetching messages:', error);
        return [];
      }),
      finalize(() => {
        unsubscribe();
      })
    );
  }

  deleteMessage(userId: string, messageID: string): Promise<void> {
    return firebase().firestore().collection("users").doc(userId).collection("messages").doc(messageID).delete()
      .then(() => {
        console.log("Message deleted successfully");
      })
      .catch((error) => {
        console.error("Error deleting message:", error);
        throw error;
      });
  }

  updateMessage(userId: string, messageID: string, messageData: any): Observable<void> {
    return from(
      firebase().firestore().collection("users").doc(userId).collection("messages").doc(messageID).update(messageData)
    ).pipe(
      catchError((error) => {
        console.error("Error updating message:", error);
        throw error;
      })
    );
  }
}
