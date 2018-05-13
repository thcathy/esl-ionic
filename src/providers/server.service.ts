import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from 'rxjs/Observable';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { ENV } from '@environment';

@Injectable()
export class ServerService {

  constructor (private http: HttpClient) {
  }

  private healthUrl = ENV.apiHost + '/health';

  healthCheck(): Observable<String> {
    console.log(`Calling health check`);
    return this.http.get<String>(this.healthUrl);
  }

}
