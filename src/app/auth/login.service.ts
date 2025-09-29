import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class loginService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.initializeUser();
  }

  private initializeUser(): void {
    const token = this.getAccessToken();
    if (token) {
      this.currentUserSubject.next({ token });
    }
  }

  login(credentials: any): Observable<any> {
    return this.http
      .post(`${environment.apiUrl}token/obtain/`, credentials)
      .pipe(
        tap((response: any) => {
          const accessToken = response.access || response.access_token;
          const refreshToken = response.refresh || response.refresh_token;

          if (accessToken && refreshToken) {
            this.saveTokens(accessToken, refreshToken);
            this.currentUserSubject.next({
              token: accessToken,
              ...response.user,
            });
          } else {
            throw new Error('Invalid token response');
          }
        }),
        catchError((error) => {
          throw error;
        })
      );
  }

  refreshToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      this.logout();
      throw new Error('No refresh token');
    }

    return this.http
      .post(`${environment.apiUrl}token/refresh/`, {
        refresh: refreshToken,
      })
      .pipe(
        tap((response: any) => {
          const newAccessToken = response.access || response.access_token;
          const newRefreshToken =
            response.refresh || response.refresh_token || refreshToken;

          if (newAccessToken) {
            this.saveTokens(newAccessToken, newRefreshToken);
            this.currentUserSubject.next({ token: newAccessToken });
          }
        }),
        catchError((error) => {
          this.logout();
          throw error;
        })
      );
  }

  logout(): void {
    const refreshToken = this.getRefreshToken();

    // Clear local data first
    this.clearLocalData();

    // Try to blacklist token (don't wait for response)
    if (refreshToken) {
      this.http
        .post(`${environment.apiUrl}token/blacklist/`, {
          refresh: refreshToken,
        })
        .subscribe({
          next: () => console.log('✅ Token blacklisted'),
          error: () =>
            console.log(
              '⚠️ Token blacklist failed (already logged out locally)'
            ),
        });
    }
  }

  // NEW: Silent session cleanup without redirect (for expired sessions)
  clearExpiredSession(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.currentUserSubject.next(null);
    // No automatic redirect - let components handle it
  }

  private clearLocalData(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.currentUserSubject.next(null);
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  saveTokens(access: string, refresh: string): void {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  isTokenExpired(token: string): boolean {
    try {
      const decoded: any = jwtDecode(token);
      return Date.now() >= decoded.exp * 1000;
    } catch {
      return true;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return !!token && !this.isTokenExpired(token);
  }

  hasValidToken(): boolean {
    return this.isAuthenticated();
  }

  // Check if session is valid (for app initialization)
  isSessionValid(): boolean {
    const accessToken = this.getAccessToken();
    const refreshToken = this.getRefreshToken();

    // If no tokens, session is invalid
    if (!accessToken && !refreshToken) {
      return false;
    }

    // If access token is valid, session is good
    if (accessToken && !this.isTokenExpired(accessToken)) {
      return true;
    }

    // If access expired but refresh is valid, session can be restored
    if (refreshToken && !this.isTokenExpired(refreshToken)) {
      return true;
    }

    // All tokens expired
    this.clearExpiredSession();
    return false;
  }

  // API Methods
  getBranches(): Observable<any> {
    return this.http.get(`${environment.apiUrl}branch/all/`);
  }
}
