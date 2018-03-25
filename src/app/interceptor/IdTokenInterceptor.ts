import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import {Observable} from 'rxjs/Rx'
import {Storage} from "@ionic/storage";
import 'rxjs/add/observable/fromPromise';

@Injectable()
export class IdTokenInterceptor implements HttpInterceptor {

  constructor(public storage: Storage
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    //return Observable.fromPromise(this.storage.get('id_token'))
    //  .mergeMap((token: String) => {
    //    if (token != null) {
    //      request = request.clone({
    //        setHeaders: {Authorization: `Bearer ${token}`}
    //      });
    //    }
    //    return next.handle(request);
    //  });

    let idToken = localStorage.getItem('id_token');

    if (idToken) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${idToken}`,
          //UserId: 'google-oauth2|111915626940466766867'
        }
      });
    }

    return next.handle(request);
  }
}
