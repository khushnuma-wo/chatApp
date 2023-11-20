import { createReducer, on } from '@ngrx/store';
import { goToLogin } from '../actions/router.action';

export interface RouterState {
}

export const initialState: RouterState = {
};

export const appReducer = createReducer(
  initialState,
  on(goToLogin, (state) => ({
    ...state,
  }))
);
