import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class IdTokenInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    //const idToken = localStorage.getItem('id_token');
//
    //if (idToken) {
    //  request = request.clone({
    //    setHeaders: {
    //      Authorization: `Bearer ${idToken}`
    //    }
    //  });
    //}

    return next.handle(request);
  }
}
