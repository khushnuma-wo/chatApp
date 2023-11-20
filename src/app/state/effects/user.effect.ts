import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { from, of } from 'rxjs';

import { UserService } from "../../services/user.service";
import * as UserActions from "../../state/actions/user.action";

@Injectable()
export class UserEffects {
  constructor(private actions$: Actions, private userService: UserService) { }
  loadUserData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadUserData),
      switchMap(() =>
        from(this.userService.getCurrentUser()).pipe(
          map((userData) =>
            UserActions.loadUserDataSuccess({ userData }),
          ),
          catchError((error) =>
            of(UserActions.loadUserDataFailure({ error })),
          ),
        ),
      ),
    ),
  );
  loadAllUsers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadAllUsers),
      switchMap(() =>
        from(this.userService.getAllUsers()).pipe(
          map((users) => UserActions.loadAllUsersSuccess({ users: users })),
          catchError((error) => of(UserActions.loadAllUsersFailure({ error })))
        )
      )
    )
  );
  loadSingleUserData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.loadSingleUserData),
      switchMap((action) =>
        from(this.userService.getSingleUser(action.userId.toString())).pipe(
          map((user) =>
            UserActions.loadSingleUserDataSuccess({ user }),
          ),
          catchError((error) =>
            of(UserActions.loadSingleUserDataFailure({ error }),
            ),
          ),
        ),
      ),
    )
  );
  sendPasswordResetLink$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UserActions.sendPasswordResetLink),
      switchMap((action) =>
        this.userService.sendPasswordResetLink(action.email).pipe(
          map(() => UserActions.sendPasswordResetLinkSuccess()),
          catchError((error) => {
            console.error('Error sending password reset email:', error);
            return of(UserActions.sendPasswordResetLinkFailure({ error }));
          })
        )
      )
    )
  );
}