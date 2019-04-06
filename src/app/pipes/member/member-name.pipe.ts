import { Pipe, PipeTransform } from '@angular/core';
import {Member} from '../../entity/member';

@Pipe({
  name: 'memberName'
})
export class MemberNamePipe implements PipeTransform {

  transform(value: Member, args?: any): any {
    if (value.name && value.name.lastName) {
      return `${value.name.firstName} ${value.name.lastName}`;
    } else if (value.name && value.name.firstName != null) {
      return value.name.firstName;
    } else {
      return value.emailAddress;
    }
  }

}
