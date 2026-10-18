import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {environment} from '../../environments/environment';

export interface FeedbackRequest {
  email: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private readonly feedbackUrl = environment.apiHost + '/feedback';

  constructor(private readonly http: HttpClient) {}

  /** Posts to esl-rest `POST /feedback`. An empty 200 body is success. */
  submit(request: FeedbackRequest): Observable<void> {
    return this.http.post(this.feedbackUrl, {
      email: request.email,
      message: request.message,
    }, {responseType: 'text'}).pipe(map(() => undefined));
  }
}
