import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from 'rxjs/Observable';

import {ENV} from "@app/env";

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';



@Injectable()
export class ServerService {

  constructor (private http: HttpClient) {
  }

  private healthUrl = ENV.apiHost + '/health';

  healthCheck(): Observable<String> {
    console.error(`CALLING HEALTH CHECK`);
    return this.http.get<String>(this.healthUrl);
  }

}
