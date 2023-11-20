import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { of, from } from 'rxjs';
import * as ChatListActions from '../actions/chat-list.action';
import { ChatListService } from '../../services/chat-list.service';
import { UserService } from '~/app/services/user.service';

@Injectable()
export class ChatListEffects {
  constructor(private actions$: Actions, private chatListService: ChatListService,private userService:UserService) {}

  loadChatList$ = createEffect(() =>
  this.actions$.pipe(
    ofType(ChatListActions.loadChatList),
    mergeMap(() =>
      from(this.userService.getCurrentUser()).pipe(
        tap(currentUser => {
          console.log('Current User:', currentUser);
        }),
        mergeMap(currentUser => {
          return from(this.chatListService.getUsersWithMessageCollection(currentUser)).pipe(
            tap(chatList => {
              console.log('Chat List:', chatList);
            }),
            map(chatList => ChatListActions.loadChatListSuccess({ chatList })),
            catchError(error => of(ChatListActions.loadChatListFailure({ error })))
          );
        })
      )
    )
  )
);
}
