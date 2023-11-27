import { Injectable } from '@angular/core';
import { firebase } from '@nativescript/firebase-core';
import '@nativescript/firebase-firestore';
import { EMPTY, Observable, Subject, catchError, concatAll, finalize, forkJoin, from, map, mergeMap, of, throwError, toArray } from 'rxjs';
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
  
    if (!imageUrls || !imageUrls.length) {
      // No media to upload, directly set the message data in the batch
      const batch = firebase().firestore().batch();
      batch.set(firebase().firestore().doc(senderPath), messageData);
      batch.set(firebase().firestore().doc(receiverPath), { ...messageData, isLoggedIn: false });
  
      return from(batch.commit()).pipe(
        catchError((error) => {
          console.error('Error:', error);
          return EMPTY; // Use EMPTY instead of of(undefined)
        })
      );
    } else {
      // Upload media files
      const mediaUploadObservables = imageUrls.map((media) => this.uploadMediaFiles(messageID, media));
  
      return forkJoin(mediaUploadObservables).pipe(
        mergeMap((mediaUploadResults: any[]) => {
          if (mediaUploadResults.length === 0) {
            console.log('No mediaUploadResults, not sending the message.');
            return EMPTY; // Use EMPTY instead of throwError
          }
  
          const updatedMessageData: Message = {
            ...messageData,
            imageUrls: mediaUploadResults,
          };
          console.log("updatedMessageData", updatedMessageData);
  
          const batch = firebase().firestore().batch();
          batch.set(firebase().firestore().doc(senderPath), updatedMessageData);
          batch.set(firebase().firestore().doc(receiverPath), { ...updatedMessageData, isLoggedIn: false });
  
          // Commit the batch to update Firestore documents.
          return from(batch.commit());
        }),
        catchError((error) => {
          console.error('Error:', error);
          return EMPTY;
        })
      );
    }
  }
  


  private uploadMediaFiles(messageID: string, media: any): Observable<any> {
    let remoteFullPath = '';
    let metadata = { contentType: '' };
    if (media) {
      if (media.fileType === 'png') {
        remoteFullPath = `images/${messageID}/photo-${Math.random()}-${Date.now()}.png`;
        metadata.contentType = 'image/png';
      }

      return from(
        new Promise((resolve, reject) => {
          const reference = firebase().storage().ref(remoteFullPath);
          const task = reference.putFile(media.path);
          task.on('state_changed' as any,
            (taskSnapshot) => {
              console.log(`${taskSnapshot.bytesTransferred} transferred out of ${taskSnapshot.totalBytes}`);
            },
            (error) => {
              console.error('Error during upload:', error);
              reject(error);
            },
            () => {
              firebase().storage().ref(remoteFullPath).getDownloadURL()
                .then((url) => {
                  const result = {
                    url,
                    fileType: media.fileType
                  };
                  return resolve(result);
                })
                .catch((urlError) => {
                  console.error('Error getting download URL:', urlError);
                  reject(urlError);
                });
            }
          );
        })
      );
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