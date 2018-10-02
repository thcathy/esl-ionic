import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Service} from "../root.service";

import {environment} from "../../../environments/environment";
import {VocabPracticeHistory} from "../../entity/vocab-practice-history";
import {MemberVocabulary} from "../../entity/member-vocabulary";

@Injectable({ providedIn: 'root' })
export class MemberVocabularyService extends Service {

  constructor (private http: HttpClient) {
    super();
  }

  private saveHistoryUrl = environment.apiHost + '/member/vocab/practice/history/save';

  saveHistory(histories: VocabPracticeHistory[]) {
    return this.http.post<MemberVocabulary[]>(this.saveHistoryUrl, histories);
  }

}
