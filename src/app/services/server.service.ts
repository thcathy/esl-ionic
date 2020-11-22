import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {environment} from '../../environments/environment';
import {Observable} from 'rxjs/internal/Observable';
import {NGXLogger} from 'ngx-logger';
import {catchError} from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class ServerService {

  constructor (
    private http: HttpClient,
    private log: NGXLogger,
  ) {
  }

  private healthUrl1 = environment.apiHost + '/health';
  private healthUrl2 = environment.apiHost + '/actuator/health';

  healthCheck(): Observable<String> {
    this.log.info(`Calling health check`);
    return this.http
      .get<String>(this.healthUrl2)
      .pipe(
        catchError(() => this.http.get<String>(this.healthUrl1))
      );
  }

}
