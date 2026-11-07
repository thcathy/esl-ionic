import {TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';

import {FlagImageService} from './flag-image.service';
import {environment} from '../../environments/environment';

describe('FlagImageService', () => {
  let service: FlagImageService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FlagImageService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ]
    });
    service = TestBed.inject(FlagImageService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('POSTs phrase and imageIndex to /flag-image', () => {
    let completed = false;

    service.flag({phrase: 'bus stop', imageIndex: 2}).subscribe(() => {
      completed = true;
    });

    const req = httpMock.expectOne(environment.apiHost + '/flag-image');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({phrase: 'bus stop', imageIndex: 2});
    expect(req.request.headers.has('X-API-KEY')).toBeFalse();
    expect(req.request.url).not.toContain('image-generation');
    expect(req.request.url).not.toContain('image-report');
    req.flush({id: 1, phrase: 'bus stop', imageIndex: 2, count: 1});
    expect(completed).toBeTrue();
  });

  it('surfaces an HTTP error without treating it as success', () => {
    let failed = false;

    service.flag({phrase: 'apple', imageIndex: 0}).subscribe({
      next: () => fail('expected the request to fail'),
      error: () => failed = true,
    });

    const req = httpMock.expectOne(environment.apiHost + '/flag-image');
    req.flush('nope', {status: 500, statusText: 'Server Error'});
    expect(failed).toBeTrue();
  });
});
