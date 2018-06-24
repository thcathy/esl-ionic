import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from 'rxjs/Observable';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { ENV } from '@environment';

import {PracticeHistory} from "../../entity/practice-models";

@Injectable()
export class PracticeHistoryService {

  constructor (private http: HttpClient) {}

  private getAllUrl = ENV.apiHost + '/practice-history/get-all';

  getAll(): Observable<PracticeHistory[]> {
    return this.http.get<PracticeHistory[]>(this.getAllUrl);
  }
}
