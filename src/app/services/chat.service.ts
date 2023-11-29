import { Injectable } from '@angular/core';
import { firebase } from '@nativescript/firebase-core';
import '@nativescript/firebase-firestore';
import { EMPTY, Observable, Subject, async, catchError, concatAll, finalize, forkJoin, from, map, mergeMap, of, throwError, toArray } from 'rxjs';
import '@nativescript/firebase-storage';
import { UserService } from './user.service';

@Injectable()
export class ChatService {
  constructor(private userService: UserService) { }

  sendMessage(channelId, messageObj): Observable<void> {
    firebase().firestore().collection('conversations').doc(channelId).update({})
    if (!messageObj?.medias || messageObj.medias.length === 0) {
      const updatedMessageData = { ...messageObj, medias: [] };

      return this.addMessageToFirestore(channelId, updatedMessageData);
    } else {

    const mediaUploadObservables = messageObj.medias.map((media) => this.uploadMediaFiles(channelId, media));

    return forkJoin(mediaUploadObservables).pipe(
      mergeMap((mediaUploadResults: any[]) => {
        if (mediaUploadResults.length === 0) {
          console.log('No mediaUploadResults, not sending the message.');
          return EMPTY;
        }
        console.log("mediaUploadResults", mediaUploadResults)
        const updatedMessageData = { ...messageObj, medias: mediaUploadResults };

        return this.addMessageToFirestore(channelId, updatedMessageData);
      }),
      catchError((error) => {
        console.error('Error uploading media:', error);
        return EMPTY;
      })
    );
    }
  }

  private addMessageToFirestore(channelId: string, messageData: any): Observable<void> {
    return from(
      firebase()
        .firestore()
        .collection('conversations')
        .doc(channelId)
        .collection('messages')
        .add(messageData)
    ).pipe(
      map(() => void 0),
      catchError((error) => {
        console.error('Error adding message:', error);
        return EMPTY;
      })
    );
  }

  // createChannel(channelObj): Observable<any> {
  //   return new Observable((observer) => {
  //     const collectionRef = firebase().firestore().collection('conversations');
  
  //     collectionRef.add(channelObj).then((documentRef) => {
  //       const channelId = documentRef.id;
  //       collectionRef.doc(channelId).update({ id: channelId }).then(() => {
  //         observer.next({ id: channelId, ...channelObj });
  //         observer.complete();
  //       }).catch((error) => {
  //         observer.error(error);
  //         observer.complete();
  //       });
  //     }).catch((error) => {
  //       observer.error(error);
  //       observer.complete();
  //     });
  //   });
  // }
  createChannel(channelObj) {
    firebase().firestore().collection('conversations').add(channelObj).then(async (documentRef) => {
      await firebase().firestore().collection('conversations').doc(documentRef.id).update({ id: documentRef.id });
    });
  }

  getConversation(senderId): Observable<any> {
    const collectionRef = firebase().firestore().collection('conversations');

    return new Observable((observer) => {
      collectionRef.where("members", "array-contains", senderId)
        .onSnapshot((querySnapshot) => {
          const conversations = [];
          querySnapshot.forEach((doc) => {
            conversations.push({ id: doc.id, ...doc.data() });
          });
          observer.next(conversations);
          observer.complete();
        })
    });
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
                  console.log("result", result)
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

  fetchMessages(channelId: string): Observable<any[]> {
    const messagesRef = firebase().firestore().collection('conversations').doc(channelId).collection('messages').orderBy("createdAt", "desc");
  
    return new Observable((observer) => {
      messagesRef.onSnapshot((querySnapshot) => {
        const messages = [];
        const latestMessageDoc = querySnapshot.docs[0];
  
        querySnapshot.forEach((doc) => {
          messages.push({ ...doc.data(), id: doc.id, messageId: doc.id });
        });
        if (latestMessageDoc) {
          const latestObj = {
            createdAt: latestMessageDoc.data().createdAt,
            messageId: latestMessageDoc.id,
            text: latestMessageDoc.data().text,
            type: "MESSAGE"
          };
  
          firebase().firestore().collection('conversations').doc(channelId).update({ latest: latestObj });
        }
  
        observer.next(messages);
        observer.complete();
      });
    });
  }
  

  deleteMessage(channelId: string, messageID: string): Promise<void> {
    console.log("channelId", channelId, messageID)
    return firebase().firestore().collection("conversations").doc(channelId).collection("messages").doc(messageID).delete()
      .then(() => {
        console.log("Message deleted successfully");
      })
      .catch((error) => {
        console.error("Error deleting message:", error);
        throw error;
      });
  }

  updateMessage(channelId: string, messageID: string, messageData: any): Observable<void> {
    return from(
      firebase().firestore().collection("conversations").doc(channelId).collection("messages").doc(messageID).update(messageData)
    ).pipe(
      catchError((error) => {
        console.error("Error updating message:", error);
        throw error;
      })
    );
  }
  
}