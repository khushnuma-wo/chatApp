import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ChatState } from '../reducers/chat.reducer';

const selectChatState = createFeatureSelector<ChatState>('chat');

export const selectChatMessages = createSelector(
  selectChatState,
  (state) => state.messages
)