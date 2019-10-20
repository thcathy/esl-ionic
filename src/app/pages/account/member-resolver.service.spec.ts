import { TestBed } from '@angular/core/testing';

import { MemberResolverService } from './member-resolver.service';
import {SharedTestModule} from '../../../testing/shared-test.module';

describe('MemberResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [
      SharedTestModule.forRoot(),
    ],
    providers: [],
  }));


  it('should be created', () => {
    const service: MemberResolverService = TestBed.get(MemberResolverService);
    expect(service).toBeTruthy();
  });
});
