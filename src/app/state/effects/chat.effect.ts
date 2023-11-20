import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, switchMap } from 'rxjs/operators';
import { fetchMessages, fetchMessagesFailure, fetchMessagesSuccess, sendMessage } from '../actions/chat.actions';
import { ChatService } from '~/app/services/chat.service';

@Injectable()
export class ChatEffects {
  sendMessage$ = createEffect(() =>
    this.actions$.pipe(
      ofType(sendMessage),
      mergeMap(({ senderId,receiverId,message }) =>
        this.chatService.sendMessage(senderId,receiverId, message).pipe(
          map(() => {
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
  constructor(private actions$: Actions, private chatService: ChatService) {}
}
