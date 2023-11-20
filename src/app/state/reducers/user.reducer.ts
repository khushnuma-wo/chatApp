import { createReducer, on } from "@ngrx/store";
import * as UserActions from "../../state/actions/user.action";

export interface UserState {
  userData: any;
  loading: boolean;
  error: any;
  allUsers: any[];
  singleUser: any;
  isSending: boolean;
  sendPasswordResetLinkError: any;
}

const initialState: UserState = {
  userData: null,
  loading: false,
  error: null,
  allUsers: [],
  singleUser: null,
  isSending: false, 
  sendPasswordResetLinkError: null,
};

export const userReducer = createReducer(
  initialState,
  on(UserActions.loadUserData, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(UserActions.loadUserDataSuccess, (state, { userData }) => ({
    ...state,
    userData,
    loading: false,
  })),
  on(UserActions.loadUserDataFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),
  on(UserActions.loadAllUsers, (state) => ({
    ...state,
  })),
  on(UserActions.loadAllUsersSuccess, (state, { users }) => ({
    ...state,
    allUsers: users,
  })),
  on(UserActions.loadAllUsersFailure, (state, { error }) => ({
    ...state,
  })),
  on(UserActions.loadSingleUserData, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(UserActions.loadSingleUserDataSuccess, (state, { user }) => ({
    ...state,
    singleUser: user,
    loading: false,
  })),
  on(UserActions.loadSingleUserDataFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),
  on(UserActions.sendPasswordResetLink, (state) => ({
    ...state,
    isSending: true,
    sendPasswordResetLinkError: null,
  })),
  on(UserActions.sendPasswordResetLinkSuccess, (state) => ({
    ...state,
    isSending: false,
    sendPasswordResetLinkError: null,
  })),
  
  on(UserActions.sendPasswordResetLinkFailure, (state, { error }) => ({
    ...state,
    isSending: false,
    sendPasswordResetLinkError: error,
  }))  
);
