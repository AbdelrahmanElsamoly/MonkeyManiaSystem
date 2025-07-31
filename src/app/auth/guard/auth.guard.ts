import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { loginService } from '../login.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: loginService, private router: Router) {}

  canActivate(): Observable<boolean> {
    const accessToken = this.authService.getAccessToken();

    if (accessToken && !this.authService.isTokenExpired(accessToken)) {
      return of(true);
    }

    const refreshToken = this.authService.getRefreshToken();
    if (refreshToken) {
      return this.authService.refreshToken().pipe(
        map((res: any) => {
          this.authService.saveTokens(res.access, res.refresh);
          return true;
        }),
        catchError(() => {
          this.authService.logout();
          return of(false);
        })
      );
    }

    this.router.navigate(['/login']);
    return of(false);
  }
}
