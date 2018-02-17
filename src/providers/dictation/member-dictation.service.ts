import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from 'rxjs/Observable';

import {ENV} from "@app/env";

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Dictation} from "../../entity/dictation";

export interface CreateDictationRequest {
  title: string;
  description?: string;
  showImage: boolean;
  vocabulary: string[];
  suitableStudent: string;
}

@Injectable()
export class MemberDictationService {

  constructor (private http: HttpClient) {
  }

  private createDictationUrl = ENV.apiHost + '/member/dictation/create';

  createDictation(request: CreateDictationRequest): Observable<Dictation> {
    return this.http.post<Dictation>(this.createDictationUrl, request);
  }
}
