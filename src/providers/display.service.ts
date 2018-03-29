import {Injectable} from '@angular/core';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {App} from "ionic-angular";
import {Member} from "../entity/member";

@Injectable()
export class DisplayService {

  constructor(public app: App) {
  }

  public displayName(member: Member) : string {
    if (member.name && member.name.lastName)
      return member.name.firstName + ' ' + member.name.lastName;
    else if (member.name && member.name.firstName != null)
      return member.name.firstName;
    else
      return member.emailAddress;
  }
}
