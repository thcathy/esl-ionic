import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {MemberService} from '../../services/member/member.service';
import {EMPTY, Observable} from 'rxjs';
import {catchError} from 'rxjs/operators';
import {Member} from '../../entity/member';
import {NavigationService} from '../../services/navigation.service';
import {NGXLogger} from 'ngx-logger';

@Injectable({
  providedIn: 'root'
})
export class MemberResolverService  {

  constructor(
    private memberService: MemberService,
    private navService: NavigationService,
    private log: NGXLogger,
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Member> | Observable<never> {
    return this.memberService.getProfile().pipe(
      catchError(err => {
        this.log.warn(`Cannot resolve member, ${err.toString()}`);
        this.navService.openHomePage();
        return EMPTY;
      })
    );
  }
}
