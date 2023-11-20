import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { goToLogin } from '../actions/router.action';
import { RouterExtensions } from '@nativescript/angular';
import { tap } from 'rxjs/operators';

@Injectable()
export class RouterEffects {
  goToLogin$ = createEffect(() =>
    this.actions$.pipe(
      ofType(goToLogin),
      tap(() => this.routerExtensions.navigate(['/login']))
    ),
  );

  constructor(private actions$: Actions, private routerExtensions: RouterExtensions) {}
}
