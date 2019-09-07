import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';

import {Dictation} from '../../entity/dictation';
import {environment} from '../../../environments/environment';
import {Observable} from 'rxjs/internal/Observable';

export interface EditDictationRequest {
  dictationId?: number;
  title: string;
  description?: string;
  showImage: boolean;
  vocabulary: string[];
  suitableStudent: string;
  article: string;
  sentenceLength: string;
}

@Injectable({ providedIn: 'root' })
export class MemberDictationService {

  constructor (private http: HttpClient) {
  }

  private editDictationUrl = environment.apiHost + '/member/dictation/edit';
  private getAllDictationUrl = environment.apiHost + '/member/dictation/getall';
  private deleteDictationUrl = environment.apiHost + '/member/dictation/delete/';

  createOrAmendDictation(request: EditDictationRequest): Observable<Dictation> {
    return this.http.post<Dictation>(this.editDictationUrl, request);
  }

  getAllDictation(): Observable<Dictation[]> {
    return this.http.get<Dictation[]>(this.getAllDictationUrl);
  }

  deleteDictation(id: number) {
    return this.http.get<Dictation>(this.deleteDictationUrl + id);
  }
}
