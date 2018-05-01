import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from 'rxjs/Observable';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Dictation} from "../../entity/dictation";
import {ENV} from "../../environment/environment";

export interface CreateDictationRequest {
  title: string;
  description?: string;
  showImage: boolean;
  vocabulary: string[];
  suitableStudent: string;
}

export interface EditDictationRequest {
  dictationId?: number;
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

  private editDictationUrl = ENV.apiHost + '/member/dictation/edit';
  private getAllDictationUrl = ENV.apiHost + '/member/dictation/getall';

  createOrAmendDictation(request: EditDictationRequest): Observable<Dictation> {
    return this.http.post<Dictation>(this.editDictationUrl, request);
  }

  getAllDictation(): Observable<Dictation[]> {
    return this.http.get<Dictation[]>(this.getAllDictationUrl);
  }
}
