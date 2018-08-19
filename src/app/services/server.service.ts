import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

import {environment} from "../../environments/environment";
import {Observable} from "rxjs/internal/Observable";

@Injectable({ providedIn: 'root' })
export class ServerService {

  constructor (private http: HttpClient) {
  }

  private healthUrl = environment.apiHost + '/health';

  healthCheck(): Observable<String> {
    console.log(`Calling health check`);
    return this.http.get<String>(this.healthUrl);
  }

}
