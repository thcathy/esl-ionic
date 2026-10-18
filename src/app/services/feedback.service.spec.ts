import {TestBed} from '@angular/core/testing';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';

import {FeedbackService} from './feedback.service';
import {environment} from '../../environments/environment';

describe('FeedbackService', () => {
  let service: FeedbackService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FeedbackService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ]
    });
    service = TestBed.inject(FeedbackService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('POSTs email and message to /feedback', () => {
    let completed = false;

    service.submit({email: 'learner@example.com', message: 'The audio was quiet.'}).subscribe(() => {
      completed = true;
    });

    const req = httpMock.expectOne(environment.apiHost + '/feedback');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'learner@example.com',
      message: 'The audio was quiet.',
    });
    req.flush('');
    expect(completed).toBeTrue();
  });

  it('surfaces an HTTP error without treating it as success', () => {
    let failed = false;

    service.submit({email: 'learner@example.com', message: 'Hello'}).subscribe({
      next: () => fail('expected the request to fail'),
      error: () => failed = true,
    });

    const req = httpMock.expectOne(environment.apiHost + '/feedback');
    req.flush('nope', {status: 500, statusText: 'Server Error'});
    expect(failed).toBeTrue();
  });
});
