import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {environment} from '../../environments/environment';
import {ContactChannel} from './contact-channel';

export interface FeedbackRequest {
  channel: ContactChannel;
  contact: string;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private readonly feedbackUrl = environment.apiHost + '/feedback';

  constructor(private readonly http: HttpClient) {}

  /** Posts to esl-rest `POST /feedback`. An empty 200 body is success. */
  submit(request: FeedbackRequest): Observable<void> {
    const body: Record<string, string> = {
      channel: request.channel,
      contact: request.contact,
      message: request.message,
    };
    if (request.channel === 'email') {
      body.email = request.contact;
    }
    return this.http.post(this.feedbackUrl, body, {responseType: 'text'}).pipe(map(() => undefined));
  }
}
