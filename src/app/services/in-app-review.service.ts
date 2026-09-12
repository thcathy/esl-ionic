import { Injectable } from '@angular/core';
import { InAppReview } from '@capacitor-community/in-app-review';
import { NGXLogger } from 'ngx-logger';
import { AppService } from './app.service';

export const inAppReviewApi = {
  requestReview: () => InAppReview.requestReview(),
};

@Injectable({
  providedIn: 'root'
})
export class InAppReviewService {

  private requestedThisProcess = false;

  constructor(
    private appService: AppService,
    private log: NGXLogger,
  ) {}

  considerReview(): void {
    if (!this.appService.isApp()) {
      return;
    }
    if (this.requestedThisProcess) {
      return;
    }
    this.requestedThisProcess = true;
    void inAppReviewApi.requestReview().catch(e =>
      this.log.warn('InAppReview.requestReview failed', e)
    );
  }
}
