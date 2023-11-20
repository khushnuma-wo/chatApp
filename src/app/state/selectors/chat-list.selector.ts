import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ChatListState } from '../reducers/chat-list.reducer';

export const selectChatListState = createFeatureSelector<ChatListState>('chatList');

export const selectChatList = createSelector(selectChatListState, (state) => state.chatList);
export const selectChatListError = createSelector(selectChatListState, (state) => state.error);