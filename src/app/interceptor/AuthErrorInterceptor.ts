import {Injectable} from '@angular/core';
import {HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {NGXLogger} from 'ngx-logger';
import {FFSAuthService} from '../services/auth.service';

@Injectable()
export class AuthErrorInterceptor implements HttpInterceptor {

  constructor(
    private authService: FFSAuthService,
    private log: NGXLogger
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          this.handleAuthError(req.url);
        }
        return throwError(() => error);
      })
    );
  }

  private handleAuthError(requestUrl: string): void {
    this.log.warn(`[AuthErrorInterceptor] 401 Unauthorized for ${requestUrl} - redirecting to login`);
    this.authService.login();
  }
}
