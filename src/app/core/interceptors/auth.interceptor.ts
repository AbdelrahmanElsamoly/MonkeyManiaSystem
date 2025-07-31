import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { loginService } from 'src/app/auth/login.service';
import { ToastrService } from 'ngx-toastr';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(
    private authService: loginService,
    private toaster: ToastrService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const token = this.authService.getAccessToken();

    let headers = req.headers.set('accept-language', 'ar');
    if (token) headers = headers.set('Authorization', `Bearer ${token}`);

    const clonedReq = req.clone({ headers });

    return next.handle(clonedReq).pipe(
      catchError((error) => {
        if (error instanceof HttpErrorResponse && error.status === 401) {
          return this.handle401Error(clonedReq, next);
        }
        return throwError(() => {
          this.toaster.error(error.error.message);
        });
      })
    );
  }

  private handle401Error(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((res: any) => {
          this.isRefreshing = false;
          this.authService.saveTokens(res.access, res.refresh);
          this.refreshTokenSubject.next(res.access);
          return next.handle(
            req.clone({
              headers: req.headers.set('Authorization', `Bearer ${res.access}`),
            })
          );
        }),
        catchError((err) => {
          this.isRefreshing = false;
          this.authService.logout();
          return throwError(() => err);
        })
      );
    } else {
      return this.refreshTokenSubject.pipe(
        filter((token) => token !== null),
        take(1),
        switchMap((token) =>
          next.handle(
            req.clone({
              headers: req.headers.set('Authorization', `Bearer ${token}`),
            })
          )
        )
      );
    }
  }
}
