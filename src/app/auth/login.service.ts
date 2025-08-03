import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class loginService {
  constructor(private http: HttpClient, private router: Router) {}

  login(body: any): Observable<any> {
    return this.http.post(`token/obtain/`, body);
  }

  refreshToken(): Observable<any> {
    const refresh = this.getRefreshToken();
    return this.http.post(`token/refresh/`, { refresh });
  }

  logout(): void {
    const refresh = this.getRefreshToken();
    if (refresh) {
      this.http.post(`token/blacklist/`, { refresh }).subscribe({
        complete: () => this.clearSession(),
      });
    } else {
      this.clearSession();
    }
  }

  clearSession(): void {
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

  // get branches
  getBranches() {
    return this.http.get(`branch/all/`);
  }
}
