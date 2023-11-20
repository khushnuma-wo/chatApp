import { createReducer, on } from '@ngrx/store';
import * as ChatListActions from '../actions/chat-list.action';
import { User } from '../interfaces/user.interface';

export interface ChatListState {
  chatList: User[] | null;
  error: any | null;
}

const initialState: ChatListState = {
  chatList: null,
  error: null,
};

export const chatListReducer = createReducer(
  initialState,
  on(ChatListActions.loadChatListSuccess, (state, { chatList }) => ({
    ...state,
    chatList,
    error: null,
  })),
  on(ChatListActions.loadChatListFailure, (state, { error }) => ({
    ...state,
    chatList: null,
    error,
  }))
);
