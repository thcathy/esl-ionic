import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../environments/environment';

@Injectable()
export class IdTokenInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // return Observable.fromPromise(this.storage.get('id_token'))
    //  .mergeMap((token: String) => {
    //    if (token != null) {
    //      request = request.clone({
    //        setHeaders: {Authorization: `Bearer ${token}`}
    //      });
    //    }
    //    return next.handle(request);
    //  });

    const idToken = localStorage.getItem('id_token');

    if (idToken && !this.isStaticHostRequest(request.url)) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${idToken}`,
        }
      });
    }

    return next.handle(request);
  }

  isStaticHostRequest(url: String) {
    return url.indexOf(environment.staticHost) > -1;
  }
}
