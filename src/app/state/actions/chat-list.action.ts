import { createAction, props } from '@ngrx/store';
import { User } from '../interfaces/user.interface';

export const loadChatList = createAction('[Chat List] Load Chat List');
export const loadChatListSuccess = createAction('[Chat List] Load Chat List Success', props<{ chatList: User[] }>());
export const loadChatListFailure = createAction('[Chat List] Load Chat List Failure', props<{ error: any }>());
