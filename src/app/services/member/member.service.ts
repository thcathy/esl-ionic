import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

import {Member} from "../../entity/member";
import {environment} from "../../../environments/environment";
import {Observable} from "rxjs/internal/Observable";

export interface UpdateMemberRequest {
  lastName?: string;
  firstName?: string;
  birthday?: Date;
  address?: string;
  phoneNumber?: string;
  school?: string;
}

@Injectable({ providedIn: 'root' })
export class MemberService {

  constructor (private http: HttpClient) {
  }

  private getMemberUrl = environment.apiHost + '/member/profile/get';
  private updateMemberUrl = environment.apiHost + '/member/profile/update';

  getProfile(): Observable<Member> {
    return this.http.get<Member>(this.getMemberUrl);
  }

  update(request: UpdateMemberRequest): Observable<Member> {
    return this.http.post<Member>(this.updateMemberUrl, request);
  }

}
