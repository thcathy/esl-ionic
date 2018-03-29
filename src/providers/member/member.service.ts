import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from 'rxjs/Observable';

import {ENV} from "@app/env";

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Member} from "../../entity/member";


@Injectable()
export class MemberService {

  constructor (private http: HttpClient) {
  }

  private getMemberUrl = ENV.apiHost + '/member/profile/get';

  getProfile(): Observable<Member> {
    return this.http.get<Member>(this.getMemberUrl);
  }

}
