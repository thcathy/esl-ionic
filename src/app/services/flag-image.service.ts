import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {environment} from '../../environments/environment';

export interface FlagImageRequest {
  phrase: string;
  imageIndex: number;
}

export interface FlagImageResponse {
  id: number;
  phrase: string;
  imageIndex: number;
  count: number;
}

@Injectable({ providedIn: 'root' })
export class FlagImageService {
  private readonly flagUrl = environment.apiHost + '/flag-image';

  constructor(private readonly http: HttpClient) {}

  /** Posts to esl-rest `POST /flag-image`. Anonymous calls are allowed. */
  flag(request: FlagImageRequest): Observable<void> {
    return this.http.post<FlagImageResponse>(this.flagUrl, {
      phrase: request.phrase,
      imageIndex: request.imageIndex,
    }).pipe(map(() => undefined));
  }
}
