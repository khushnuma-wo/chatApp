import { createReducer, on } from '@ngrx/store';
import { fetchMessagesSuccess, sendMessage, deleteChatMessage, updateMessage } from '../actions/chat.actions';
import { MessageModel } from '../class/message.class';

export interface ChatState {
  messages: { messages: MessageModel }[];
  loading: boolean;
}

const initialState: ChatState = {
  messages: [],
  loading: false,
};

export const chatReducer = createReducer(
  initialState,
  on(sendMessage, (state, { messages }) => {
    return {
      ...state,
      messages: [
        ...state.messages,
        messages,
      ],
    };
  }),
  on(fetchMessagesSuccess, (state, { messages }) => {
    return {
      ...state,
      messages,
    };
  }),
  on(deleteChatMessage, (state, { channelId, messageID }) => {
    const filteredMessages = state.messages.filter(message => message['messageId'] !== messageID);
    return {
      ...state,
      messages: filteredMessages,
    };
  }),
  on(updateMessage, (state, { channelId, messageID, updatedMessageObject }) => {
    const updatedMessages = state.messages.map(message => {
      if (message['messageId'] === messageID) {
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