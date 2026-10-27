import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {ModalController} from '@ionic/angular';

import {Dictation} from '../../entity/dictation';
import {AnalyticsService} from '../../services/analytics.service';
import {IonicComponentService} from '../../services/ionic-component.service';
import {ShareService} from '../../services/share.service';
import {SharedTestModule} from '../../../testing/shared-test.module';
import {ShareDictationModalComponent} from './share-dictation-modal.component';

describe('ShareDictationModalComponent', () => {
  let fixture: ComponentFixture<ShareDictationModalComponent>;
  let component: ShareDictationModalComponent;
  let shareService: jasmine.SpyObj<ShareService>;
  let analytics: jasmine.SpyObj<AnalyticsService>;
  let ionic: jasmine.SpyObj<IonicComponentService>;
  const shareUrl = 'https://www.funfunspell.com/link/dictation-view/42';

  beforeEach(waitForAsync(() => {
    shareService = jasmine.createSpyObj('ShareService', [
      'dictationShareUrl',
      'canUseSystemShare',
      'copyLink',
      'nativeShare',
      'qrDataUrl',
      'qrCardDataUrl',
      'saveQrPng',
    ]);
    shareService.dictationShareUrl.and.returnValue(shareUrl);
    shareService.canUseSystemShare.and.resolveTo(false);
    shareService.qrDataUrl.and.resolveTo('data:image/png;base64,aaa');
    shareService.qrCardDataUrl.and.resolveTo('data:image/png;base64,card');
    shareService.copyLink.and.resolveTo();
    shareService.nativeShare.and.resolveTo();
    shareService.saveQrPng.and.resolveTo(false);
    analytics = jasmine.createSpyObj('AnalyticsService', ['share']);
    ionic = jasmine.createSpyObj('IonicComponentService', ['showToastMessage']);

    TestBed.configureTestingModule({
      imports: [SharedTestModule.forRoot()],
      providers: [
        {provide: ShareService, useValue: shareService},
        {provide: AnalyticsService, useValue: analytics},
        {provide: IonicComponentService, useValue: ionic},
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareDictationModalComponent);
    component = fixture.componentInstance;
    component.dictation = {id: 42, title: 'Apple'} as Dictation;
  });

  async function render(): Promise<void> {
    fixture.detectChanges();
    await component.ngOnInit();
  }

  it('shows the QR and hides system share when canShare is false', async () => {
    await render();

    expect(fixture.nativeElement.querySelector('.dictation-name')?.textContent).toContain('Apple');
    expect(fixture.nativeElement.querySelector('.qr')?.getAttribute('src')).toBe('data:image/png;base64,aaa');
    expect(fixture.nativeElement.querySelector('.qr')?.getAttribute('alt')).toBe('QR code for this dictation');
    expect(fixture.nativeElement.querySelector('.caption')?.textContent).toContain('Scan to open this dictation');
    expect(fixture.nativeElement.querySelector('.scan-how')?.textContent).toContain("Open your phone's Camera app and point it at the QR code.");
    expect(fixture.nativeElement.querySelector('.system-share-button')).toBeNull();
    expect(analytics.share).toHaveBeenCalledOnceWith('qr_view');
  });

  it('shows system share when canShare is true', async () => {
    shareService.canUseSystemShare.and.resolveTo(true);
    await render();

    expect(fixture.nativeElement.querySelector('.system-share-button')).toBeTruthy();
  });

  it('copies the canonical url and records the copy method', async () => {
    await render();
    await component.copyLink();

    expect(shareService.copyLink).toHaveBeenCalledOnceWith(shareUrl);
    expect(analytics.share).toHaveBeenCalledWith('copy');
    expect(ionic.showToastMessage).toHaveBeenCalledWith('Link copied');
  });

  it('does not record copy when the clipboard fails', async () => {
    shareService.copyLink.and.rejectWith(new Error('denied'));
    await render();
    analytics.share.calls.reset();

    await component.copyLink();

    expect(analytics.share).not.toHaveBeenCalled();
    expect(ionic.showToastMessage).toHaveBeenCalledWith('Could not copy the link. Please try again.');
  });

  it('saves the QR png and records qr_download when the save starts', async () => {
    shareService.saveQrPng.and.resolveTo(true);
    await render();
    await component.saveQr();

    expect(shareService.qrCardDataUrl).toHaveBeenCalledOnceWith(shareUrl, 'Apple');
    expect(shareService.saveQrPng).toHaveBeenCalledOnceWith(
      'data:image/png;base64,card',
      'funfunspell-dictation-42.png',
    );
    expect(analytics.share).toHaveBeenCalledWith('qr_download');
  });

  it('saves the plain QR when the named image cannot be drawn', async () => {
    shareService.qrCardDataUrl.and.rejectWith(new Error('canvas'));
    shareService.saveQrPng.and.resolveTo(true);
    await render();
    await component.saveQr();

    expect(shareService.saveQrPng).toHaveBeenCalledOnceWith(
      'data:image/png;base64,aaa',
      'funfunspell-dictation-42.png',
    );
  });

  it('does not record qr_download when the save does not start', async () => {
    shareService.saveQrPng.and.resolveTo(false);
    await render();
    analytics.share.calls.reset();

    await component.saveQr();

    expect(shareService.saveQrPng).toHaveBeenCalled();
    expect(analytics.share).not.toHaveBeenCalled();
  });

  it('does not ask to scan when the QR could not be made', async () => {
    shareService.qrDataUrl.and.rejectWith(new Error('qr'));
    await render();

    expect(fixture.nativeElement.querySelector('.qr-error')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.scan-hint')).toBeNull();
    expect(fixture.nativeElement.querySelector('.copy-link-button')).toBeTruthy();
  });

  it('dismisses when the dictation has no public id', async () => {
    const modalController = TestBed.inject(ModalController);
    spyOn(modalController, 'dismiss').and.resolveTo(true);
    component.dictation = {title: 'Apple'} as Dictation;
    shareService.dictationShareUrl.and.returnValue(null);

    await render();

    expect(modalController.dismiss).toHaveBeenCalled();
    expect(shareService.qrDataUrl).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.actions')).toBeNull();
    expect(analytics.share).not.toHaveBeenCalled();
  });

  it('records native share only after the sheet succeeds', async () => {
    await render();
    analytics.share.calls.reset();
    await component.systemShare();
    expect(analytics.share).toHaveBeenCalledOnceWith('native');

    analytics.share.calls.reset();
    shareService.nativeShare.and.rejectWith(new Error('dismissed'));
    await component.systemShare();
    expect(analytics.share).not.toHaveBeenCalled();
  });
});
