import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { loginService } from '../login.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: loginService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | boolean {
    // Check if user has valid session
    if (this.authService.isSessionValid()) {
      return true;
    }

    // Check if we can try to refresh token
    const refreshToken = this.authService.getRefreshToken();
    if (refreshToken && !this.authService.isTokenExpired(refreshToken)) {
      return this.authService.refreshToken().pipe(
        map(() => {
          return true;
        }),
        catchError((error) => {
          // FIXED: Don't call logout() - just redirect
          this.redirectToLogin(state.url);
          return of(false);
        })
      );
    }

    // No valid tokens, redirect to login
    this.redirectToLogin(state.url);
    return false;
  }

  private redirectToLogin(returnUrl: string): void {
    // Clear expired tokens silently
    this.authService.clearExpiredSession();

    // Navigate to login with return URL
    this.router.navigate(['/login'], {
      queryParams: { returnUrl },
      replaceUrl: true, // Don't add to browser history
    });
  }
}
