import { createReducer, on } from '@ngrx/store';
import { fetchMessagesSuccess, sendMessage, deleteChatMessage, updateMessage } from '../actions/chat.actions';

export interface ChatState {
  messages: { id?: string, senderId: string; receiverId: string; message: string; timestamp?: string }[];
  loading: boolean;
}

const initialState: ChatState = {
  messages: [],
  loading: false,
};

export const chatReducer = createReducer(
  initialState,
  on(sendMessage, (state, { senderId, receiverId, message, timestamp, isLoggedIn, imageUrls }) => {
    return {
      ...state,
      messages: [
        ...state.messages,
        { senderId, receiverId, message, timestamp, isLoggedIn, imageUrls },
      ],
    };
  }),
  on(fetchMessagesSuccess, (state, { messages }) => {
    return {
      ...state,
      messages,
    };
  }),
  on(deleteChatMessage, (state, { userId, messageID }) => {
    const updatedMessages = state.messages.filter(message => message.id !== messageID);
    return {
      ...state,
      messages: updatedMessages,
    };
  }),
  on(updateMessage, (state, { userId, messageID, updatedMessageObject }) => {
    const updatedMessages = state.messages.map(message => {
      if (message.id === messageID) {
        return {
          ...message,
          ...updatedMessageObject,
        };
      }
      return message;
    });

    return {
      ...state,
      messages: updatedMessages,
    };
  })
)