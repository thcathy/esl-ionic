import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

import {PracticeHistory} from "../../entity/practice-models";
import {environment} from "../../../environments/environment";
import {Observable} from "rxjs/internal/Observable";

@Injectable({ providedIn: 'root' })
export class PracticeHistoryService {

  constructor (private http: HttpClient) {}

  private getAllUrl = environment.apiHost + '/practice-history/get-all';

  getAll(): Observable<PracticeHistory[]> {
    return this.http.get<PracticeHistory[]>(this.getAllUrl);
  }
}
