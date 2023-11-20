import { createReducer, on } from '@ngrx/store';
import { fetchMessagesSuccess, sendMessage } from '../actions/chat.actions';

export interface ChatState {
  messages: { senderId: string; receiverId: string; message: string;timestamp?:string }[];
  loading: boolean; 
}

const initialState: ChatState = {
  messages: [],
  loading: false,
};

export const chatReducer = createReducer(
  initialState,
  on(sendMessage, (state, { senderId, receiverId, message }) => {
    return {
      ...state,
      messages: [
        ...state.messages,
        { senderId,receiverId, message },
      ],
    };
  }),
  on(fetchMessagesSuccess, (state, { messages }) => {
    return {
      ...state,
      messages,
    };
  })
)
