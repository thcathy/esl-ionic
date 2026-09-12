import { fakeAsync, flush } from '@angular/core/testing';
import { AppServiceSpy, NGXLoggerSpy } from '../../testing/mocks-ionic';
import { InAppReviewService, inAppReviewApi } from './in-app-review.service';

describe('InAppReviewService', () => {
  let service: InAppReviewService;
  let appServiceSpy: ReturnType<typeof AppServiceSpy>;
  let loggerSpy: ReturnType<typeof NGXLoggerSpy>;
  let requestReviewSpy: jasmine.Spy;

  beforeEach(() => {
    appServiceSpy = AppServiceSpy();
    loggerSpy = NGXLoggerSpy();
    requestReviewSpy = spyOn(inAppReviewApi, 'requestReview').and.returnValue(Promise.resolve());
    service = new InAppReviewService(appServiceSpy, loggerSpy);
  });

  it('does not call requestReview when not native app', () => {
    appServiceSpy.isApp.and.returnValue(false);

    service.considerReview();

    expect(requestReviewSpy).not.toHaveBeenCalled();
  });

  it('calls requestReview immediately on native app', () => {
    appServiceSpy.isApp.and.returnValue(true);

    service.considerReview();

    expect(requestReviewSpy).toHaveBeenCalledTimes(1);
  });

  it('calls requestReview only once when considerReview invoked twice', () => {
    appServiceSpy.isApp.and.returnValue(true);

    service.considerReview();
    service.considerReview();

    expect(requestReviewSpy).toHaveBeenCalledTimes(1);
  });

  it('logs on requestReview rejection and does not call again', fakeAsync(() => {
    appServiceSpy.isApp.and.returnValue(true);
    requestReviewSpy.and.callFake(() => Promise.reject(new Error('fail')));

    service.considerReview();
    flush();

    expect(loggerSpy.warn).toHaveBeenCalled();
    expect(requestReviewSpy).toHaveBeenCalledTimes(1);

    service.considerReview();
    flush();

    expect(requestReviewSpy).toHaveBeenCalledTimes(1);
  }));
});
