import { TestBed } from '@angular/core/testing';

import { MemberResolverService } from './member-resolver.service';

describe('MemberResolverService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MemberResolverService = TestBed.get(MemberResolverService);
    expect(service).toBeTruthy();
  });
});
