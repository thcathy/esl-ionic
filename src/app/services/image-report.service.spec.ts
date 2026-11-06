import {TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';

import {ImageReportService} from './image-report.service';
import {environment} from '../../environments/environment';

describe('ImageReportService', () => {
  let service: ImageReportService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ImageReportService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ]
    });
    service = TestBed.inject(ImageReportService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('POSTs phrase and imageIndex to /image-report', () => {
    let completed = false;

    service.report({phrase: 'bus stop', imageIndex: 2}).subscribe(() => {
      completed = true;
    });

    const req = httpMock.expectOne(environment.apiHost + '/image-report');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({phrase: 'bus stop', imageIndex: 2});
    expect(req.request.headers.has('X-API-KEY')).toBeFalse();
    expect(req.request.url).not.toContain('image-generation');
    req.flush({id: 1, phrase: 'bus stop', imageIndex: 2, memberId: null});
    expect(completed).toBeTrue();
  });

  it('surfaces an HTTP error without treating it as success', () => {
    let failed = false;

    service.report({phrase: 'apple', imageIndex: 0}).subscribe({
      next: () => fail('expected the request to fail'),
      error: () => failed = true,
    });

    const req = httpMock.expectOne(environment.apiHost + '/image-report');
    req.flush('nope', {status: 500, statusText: 'Server Error'});
    expect(failed).toBeTrue();
  });
});
