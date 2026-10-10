import { TestBed } from '@angular/core/testing';

import { Dictation } from '../entity/dictation';
import { ShareService } from './share.service';

describe('ShareService', () => {
  let service: ShareService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShareService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('shares the canonical dictation link', async () => {
    const share = jasmine.createSpy('share').and.resolveTo(undefined);
    Object.defineProperty(navigator, 'share', { configurable: true, value: share });

    await service.shareDictation({ id: 42, title: 'Apple' } as Dictation);

    expect(share).toHaveBeenCalledWith(jasmine.objectContaining({
      url: 'https://www.funfunspell.com/link/dictation-view/42',
    }));
  });
});
