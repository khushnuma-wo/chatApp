import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { from, of } from 'rxjs';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { fetchMessages, fetchMessagesFailure, fetchMessagesSuccess, sendMessage, deleteChatMessage, updateMessage } from '../actions/chat.actions';
import { ChatService } from '~/app/services/chat.service';

@Injectable()
export class ChatEffects {
  sendMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(sendMessage),
      mergeMap(({ senderId, receiverId, message, imageUrls }) =>
        this.chatService.sendMessage(senderId, receiverId, message, imageUrls).pipe(
          map((res) => {
            return { type: 'MessageSentSuccess' };
          }),
          catchError((error) => {
            console.error(error);
            return of({ type: 'MessageSentFailure', error: error });
          })
        )
      )
    )
  );
deleteChatMessage$ = createEffect(() =>
  this.actions$.pipe(
    ofType(deleteChatMessage),
    tap((res) => console.log('Delete effect triggered!')),
    mergeMap(({ userId, messageID }) =>
    from(this.chatService.deleteMessage(userId, messageID)).pipe(
      map((res) => {
        return { type: 'MessageDeleteSuccess' };
      }),
      catchError((error) => {
        console.error(error);
        return of({ type: 'MessageDeleteFailure', error: error });
      })
    )
    )
  )
);
  fetchMessages$ = createEffect(() =>
    this.actions$.pipe(
      ofType(fetchMessages),
      switchMap(({ senderId, receiverId }) =>
        this.chatService.fetchMessages(senderId, receiverId).pipe(
          map((messages) => fetchMessagesSuccess({ messages })),
          catchError((error) => of(fetchMessagesFailure({ error })))
        )
      )
    )
  );
  updateMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(updateMessage),
      mergeMap(({ userId, messageID, updatedMessageObject }) =>
        this.chatService.updateMessage(userId, messageID, updatedMessageObject).pipe(
          map(() => {
            return { type: 'MessageUpdateSuccess' };
          }),
          catchError((error) => {
            console.error(error);
            return of({ type: 'MessageUpdateFailure', error: error });
          })
        )
      )
    )
  );
  constructor(private actions$: Actions, private chatService: ChatService) { }
}
