import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest,
  HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/empty';
import 'rxjs/add/operator/retry';
import {ErrorObservable} from "rxjs/observable/ErrorObservable"; // don't forget the imports

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request)
      .catch((err: HttpErrorResponse) => {

        if (err.error instanceof Error) {
          // A client-side or network error occurred. Handle it accordingly.
          console.error('An error occurred:', err.error.message);
        } else {
          // The backend returned an unsuccessful response code.
          // The response body may contain clues as to what went wrong,
          console.error(`Backend returned code ${err.status}, body was: ${JSON.stringify(err.error)}`);
        }

        if (this.isUnknownError(err)) {
          //alert(`Cannot connect to Server, please check your network!`);
          console.error(`Cannot connect to Server, please check your network!`);
        }
        return new ErrorObservable(`Server Error! (${err.status})`);
      });
  }

  isUnknownError(err: HttpErrorResponse) {
    return err.status == 0 && err.statusText.toLowerCase().lastIndexOf('unknown') >= 0;
  }
}
