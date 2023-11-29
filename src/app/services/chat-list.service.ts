import { firebase } from '@nativescript/firebase-core';
import '@nativescript/firebase-firestore';
import { Injectable } from '@angular/core';

@Injectable()
export class ChatListService {
  constructor() { }
  newMessagesCount: { [userId: string]: number } = {};
  lastReceivedMessage: any;

  // getUsersWithMessageCollection(currentUserUid: string): Promise<any[]> {
  //   return new Promise<any[]>(async (resolve, reject) => {
  //     const usersWithMessageCollection: any[] = [];
  //     const usersRef = firebase().firestore().collection('users');
  //     const querySnapshot = await usersRef.get();

  //     const fetchUserMessages = querySnapshot.docs.map(async (doc) => {
  //       const userData = doc.data();
  //       const userUid = userData.userUid;
  //       const messagesRef = firebase().firestore().collection(`users/${userUid}/messages`);
  //       const messageCollection = await messagesRef.get();
  //       const hasMessagesWithCurrentUser = messageCollection.docs.some((messageDoc) => {
  //         const messageData = messageDoc.data() as Message;
  //         // console.log(messageData);

  //         return messageData.senderId === currentUserUid || messageData.receiverId === currentUserUid;
  //       });

  //       if (hasMessagesWithCurrentUser) {
  //         usersWithMessageCollection.push(userData);
  //       }

  //       // console.log('User Data:', userData);
  //       // console.log('Has Messages with Current User:', hasMessagesWithCurrentUser);
  //     });

  //     try {
  //       await Promise.all(fetchUserMessages);
  //       // console.log('Users with Message Collection:', usersWithMessageCollection);
  //       resolve(usersWithMessageCollection);
  //     } catch (error) {
  //       console.error('Error checking message collection:', error);
  //       reject(error);
  //     }
  //   });
  // }
  getUsersWithMessageCollection(currentUserUid: string): Promise<any[]> {
    return new Promise<any[]>(async (resolve, reject) => {
      const usersWithMessageCollection: any[] = [];
      const usersRef = firebase().firestore().collection('users');
      const querySnapshot = await usersRef.get();

      const fetchUserMessages = querySnapshot.docs.map(async (doc) => {
        const userData = doc.data();
        const userUid = userData.userUid;
        const messagesRef = firebase().firestore().collection(`users/${userUid}/messages`);
        const messageCollection = await messagesRef.get();
        const hasMessagesWithCurrentUser = messageCollection.docs.some((messageDoc) => {
          const messageData = messageDoc.data() as any;
          this.lastReceivedMessage = messageData;
          // console.log(this.lastReceivedMessage);
          
          // console.log(messageData);
          
          return (
            (messageData.senderId === currentUserUid || messageData.receiverId === currentUserUid) &&
            (!messageData.seen)
          );
        });

        if (hasMessagesWithCurrentUser) {
          usersWithMessageCollection.push(userData);
          const newMessagesCount = messageCollection.docs.filter((messageDoc) => {
            const messageData = messageDoc.data() as any;
            return messageData.isLoggedIn;
          }).length;

          this.newMessagesCount[userUid] = newMessagesCount;
          // console.log(newMessagesCount);
        }
      });
      try {
        await Promise.all(fetchUserMessages);
        resolve(usersWithMessageCollection);
      } catch (error) {
        console.error('Error checking message collection:', error);
        reject(error);
      }
    });
  }
  markMessagesAsSeen(receiverId: string): void {
    const messagesRef = firebase().firestore().collection(`users/${receiverId}/messages`);
    messagesRef.where('senderId', '==', receiverId).get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        const messageData = doc.data() as any;
        if (!messageData.seen) {
          doc.ref.update({ seen: true });
          this.newMessagesCount[receiverId] = 0;
        }
      });
    });
  }
}