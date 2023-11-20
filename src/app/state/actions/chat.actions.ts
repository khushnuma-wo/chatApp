import { createAction, props } from '@ngrx/store';
import { Message } from '../class/message.class';

export const sendMessage = createAction(
  '[Chat] Send Message',
  props<{ senderId: string;receiverId: string; message: string }>()
);
export const fetchMessages = createAction(
  '[Chat] Fetch Messages',
  props<{ senderId: string; receiverId: string }>()
);

export const fetchMessagesSuccess = createAction(
  '[Chat] Fetch Messages Success',
  props<{ messages: Message[] }>()
);

export const fetchMessagesFailure = createAction(
  '[Chat] Fetch Messages Failure',
  props<{ error: any }>()
);
