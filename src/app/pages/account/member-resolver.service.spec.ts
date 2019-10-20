import {TestBed} from '@angular/core/testing';

import { MemberResolverService } from './member-resolver.service';
import {SharedTestModule} from '../../../testing/shared-test.module';
import {NavigationService} from '../../services/navigation.service';
import {NavigationServiceSpy} from '../../../testing/mocks-ionic';
import {MemberService} from '../../services/member/member.service';
import {throwError} from 'rxjs';

describe('MemberResolverService', () => {
  const memberServiceSpy = jasmine.createSpyObj('MemberService', ['getProfile']);
  memberServiceSpy.getProfile.and.returnValue(throwError(''));
  const navigationServiceSpy = NavigationServiceSpy();

  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      SharedTestModule.forRoot(),
    ],
    providers: [
      {provide: NavigationService, useValue: navigationServiceSpy},
      {provide: MemberService, useValue: memberServiceSpy}
    ],
  }));


  it('should be created', () => {
    const service: MemberResolverService = TestBed.get(MemberResolverService);
    expect(service).toBeTruthy();
  });

  it('error in getProfile will open home page', (done: DoneFn) => {
    const service: MemberResolverService = TestBed.get(MemberResolverService);
    service.resolve(null, null).subscribe();
    expect(navigationServiceSpy.openHomePage.calls.count()).toBe(1);
    done();
  });
});
