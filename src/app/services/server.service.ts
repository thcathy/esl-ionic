import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {environment} from '../../environments/environment';
import {Observable} from 'rxjs/internal/Observable';
import {NGXLogger} from 'ngx-logger';

@Injectable({ providedIn: 'root' })
export class ServerService {

  constructor (
    private http: HttpClient,
    private log: NGXLogger,
  ) {
  }

  private healthUrl = environment.apiHost + '/health';

  healthCheck(): Observable<String> {
    this.log.info(`Calling health check`);
    return this.http.get<String>(this.healthUrl);
  }

}
