import { createAction, props } from '@ngrx/store';

export const sendMessage = createAction(
  '[Chat] Send Message',
  props<{ channelId, messages: any }>()
);
export const fetchMessages = createAction(
  '[Chat] Fetch Messages',
  props<{ channelId: string; }>()
);
export const fetchMessagesSuccess = createAction(
  '[Chat] Fetch Messages Success',
  props<{ messages: any }>()
);
export const fetchMessagesFailure = createAction(
  '[Chat] Fetch Messages Failure',
  props<{ error: any }>()
);
export const updateMessage = createAction(
  '[Chat] Update Message',
  props<{ channelId, messageID, updatedMessageObject: object }>()
);
export const deleteChatMessage = createAction(
  '[Chat] Delete Chat Message',
  props<{ channelId: string, messageID: string }>()
);