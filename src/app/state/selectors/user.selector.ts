import { createFeatureSelector, createSelector } from "@ngrx/store";
import { UserState } from "../../state/reducers/user.reducer";

export const selectUserState = createFeatureSelector<UserState>('user');

export const selectUserData = createSelector(
  selectUserState,
  (state) => state.userData
);

export const selectUserLoading = createSelector(
  selectUserState,
  (state) => state.loading
);

export const selectUserError = createSelector(
  selectUserState,
  (state) => state.error
);

export const selectAllUsers = createSelector(
  selectUserState,
  (state) => state.allUsers
)
export const selectSingleUser = createSelector(
  createFeatureSelector<UserState>('user'),
  (state) => state.singleUser
);
export const selectSendPasswordResetLinkStatus = createSelector(
  selectUserState,
  (state) => ({
    isSending: state.isSending,
    sendPasswordResetLinkError: state.sendPasswordResetLinkError,
  })
);