import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from 'rxjs/Observable';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {Member} from "../../entity/member";
import { ENV } from '@environment';
import {Dictation} from "../../entity/dictation";

export interface UpdateMemberRequest {
  lastName?: string;
  firstName?: string;
  birthday?: Date;
  address?: string;
  phoneNumber?: string;
  school?: string;
}

@Injectable()
export class MemberService {

  constructor (private http: HttpClient) {
  }

  private getMemberUrl = ENV.apiHost + '/member/profile/get';
  private updateMemberUrl = ENV.apiHost + '/member/profile/update';

  getProfile(): Observable<Member> {
    return this.http.get<Member>(this.getMemberUrl);
  }

  update(request: UpdateMemberRequest): Observable<Member> {
    return this.http.post<Member>(this.updateMemberUrl, request);
  }

}
