import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {environment} from '../../environments/environment';

export interface ImageReportRequest {
  phrase: string;
  imageIndex: number;
}

@Injectable({ providedIn: 'root' })
export class ImageReportService {
  private readonly reportUrl = environment.apiHost + '/image-report';

  constructor(private readonly http: HttpClient) {}

  /** Posts to esl-rest `POST /image-report`. A logged-in member id is taken from the existing auth token. */
  report(request: ImageReportRequest): Observable<void> {
    return this.http.post(this.reportUrl, {
      phrase: request.phrase,
      imageIndex: request.imageIndex,
    }).pipe(map(() => undefined));
  }
}
