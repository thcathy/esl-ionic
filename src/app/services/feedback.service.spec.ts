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

  it('POSTs channel, contact, and message, and repeats the address as email when Email is chosen', () => {
    let completed = false;

    service.submit({
      channel: 'email',
      contact: 'learner@example.com',
      message: 'The audio was quiet.',
    }).subscribe(() => {
      completed = true;
    });

    const req = httpMock.expectOne(environment.apiHost + '/feedback');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      channel: 'email',
      contact: 'learner@example.com',
      email: 'learner@example.com',
      message: 'The audio was quiet.',
    });
    req.flush('');
    expect(completed).toBeTrue();
  });

  it('POSTs a non-email channel without an email address', () => {
    service.submit({
      channel: 'whatsapp',
      contact: '+852 9123 4567',
      message: 'Hello',
    }).subscribe();

    const req = httpMock.expectOne(environment.apiHost + '/feedback');
    expect(req.request.body).toEqual({
      channel: 'whatsapp',
      contact: '+852 9123 4567',
      message: 'Hello',
    });
    req.flush('');
  });

  it('POSTs a message alone when no contact is given', () => {
    service.submit({message: 'Hello'}).subscribe();

    const req = httpMock.expectOne(environment.apiHost + '/feedback');
    expect(req.request.body).toEqual({message: 'Hello'});
    req.flush('');
  });

  it('surfaces an HTTP error without treating it as success', () => {
    let failed = false;

    service.submit({channel: 'messenger', contact: 'Jane Lee', message: 'Hello'}).subscribe({
      next: () => fail('expected the request to fail'),
      error: () => failed = true,
    });

    const req = httpMock.expectOne(environment.apiHost + '/feedback');
    req.flush('nope', {status: 500, statusText: 'Server Error'});
    expect(failed).toBeTrue();
  });
});
