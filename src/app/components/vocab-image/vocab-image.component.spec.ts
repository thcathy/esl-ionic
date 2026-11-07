import {ComponentFixture, TestBed, waitForAsync} from '@angular/core/testing';
import {By} from '@angular/platform-browser';
import {HttpTestingController} from '@angular/common/http/testing';
import {TranslateService} from '@ngx-translate/core';

import {SharedTestModule} from '../../../testing/shared-test.module';
import {provideNoopAnimations} from '@angular/platform-browser/animations';
import {VocabImageComponent} from './vocab-image';
import {defaultImage} from '../../entity/dictation';
import {IonicComponentService} from '../../services/ionic-component.service';
import {environment} from '../../../environments/environment';

describe('VocabImageComponent', () => {
  let component: VocabImageComponent;
  let fixture: ComponentFixture<VocabImageComponent>;
  let httpMock: HttpTestingController;
  let ionic: jasmine.SpyObj<IonicComponentService>;
  const reportThanks = 'Thanks \u2014 we\u2019ll review this image.';

  beforeEach(waitForAsync(() => {
    ionic = jasmine.createSpyObj('IonicComponentService', ['showToastMessage']);

    TestBed.configureTestingModule({
      declarations: [ VocabImageComponent ],
      imports: [SharedTestModule.forRoot()],
      providers: [
        provideNoopAnimations(),
        { provide: IonicComponentService, useValue: ionic },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VocabImageComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', {
      'VocabImage.Report': 'Wrong or bad image',
      'VocabImage.ReportThanks': reportThanks,
    }, true);
    translate.use('en');
  }));

  afterEach(() => httpMock.verify());

  it('default image if no images input', () => {
    fixture.componentRef.setInput('images', null);
    fixture.detectChanges();
    expect(component.imageBase64).toEqual(defaultImage[0]);

    fixture.componentRef.setInput('images', []);
    fixture.detectChanges();
    expect(component.imageBase64).toEqual(defaultImage[0]);
  });

  it('uses default placeholder when images are missing', () => {
    fixture.componentRef.setInput('images', []);
    fixture.detectChanges();
    expect(component.imageBase64).toEqual(defaultImage[0]);
    expect(component.showingPlaceholder).toBeTrue();
  });

  it('places previous and next on the image stage', () => {
    fixture.componentRef.setInput('images', ['https://example.com/a.jpg', 'https://example.com/b.jpg']);
    fixture.detectChanges();

    const stage = fixture.nativeElement.querySelector('.image-stage');
    const prev = stage.querySelector('ion-button.nav-prev') as HTMLElement & { disabled: boolean };
    const next = stage.querySelector('ion-button.nav-next') as HTMLElement & { disabled: boolean };

    expect(stage.querySelector('.image-clip img.image')).toBeTruthy();
    expect(prev.disabled).toBeFalse();
    expect(next.disabled).toBeFalse();
    expect(fixture.nativeElement.querySelector('ion-row')).toBeNull();
  });

  it('disables previous and next when there is only one image', () => {
    fixture.componentRef.setInput('images', ['https://example.com/a.jpg']);
    fixture.detectChanges();

    const prev = fixture.nativeElement.querySelector('ion-button.nav-prev') as HTMLElement & { disabled: boolean };
    const next = fixture.nativeElement.querySelector('ion-button.nav-next') as HTMLElement & { disabled: boolean };
    expect(component.canCycle).toBeFalse();
    expect(prev.disabled).toBeTrue();
    expect(next.disabled).toBeTrue();
  });

  it('does not show an unverified note or a report button for a placeholder', () => {
    fixture.componentRef.setInput('images', []);
    fixture.componentRef.setInput('canReport', true);
    fixture.componentRef.setInput('phrase', 'apple');
    fixture.detectChanges();

    expect(component.showingPlaceholder).toBeTrue();
    expect(fixture.nativeElement.querySelector('.unverified-note-row')).toBeNull();
    expect(fixture.nativeElement.querySelector('ion-note')).toBeNull();
    expect(reportButton()).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('Unverified');
  });

  it('hides the report button when the picture is not from the Firebase image list', () => {
    fixture.componentRef.setInput('images', ['https://example.com/a.jpg']);
    fixture.componentRef.setInput('canReport', false);
    fixture.componentRef.setInput('phrase', 'apple');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('img.image')).toBeTruthy();
    expect(reportButton()).toBeNull();
    expect(fixture.nativeElement.querySelector('.unverified-note-row')).toBeNull();
  });

  it('reports the phrase and the current Firebase image index, then keeps the image up', () => {
    const images = ['https://example.com/a.jpg', 'https://example.com/b.jpg'];
    spyOn(Math, 'random').and.returnValue(0);
    showReportable(images, 'apple', 1);

    expect(images).toEqual(['https://example.com/a.jpg', 'https://example.com/b.jpg']);
    expect(component.currentSourceIndex).toBe(1);
    expect(component.imageBase64).toBe('https://example.com/b.jpg');
    expect(reportButton().textContent).toContain('Wrong or bad image');
    expect(reportButton().getAttribute('type')).toBe('button');

    const shown = component.imageBase64;
    clickReport();

    const req = httpMock.expectOne(environment.apiHost + '/flag-image');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({phrase: 'apple', imageIndex: 1});
    expect(req.request.headers.has('X-API-KEY')).toBeFalse();
    req.flush({id: 4, phrase: 'apple', imageIndex: 1, count: 1});
    fixture.detectChanges();

    expect(ionic.showToastMessage).toHaveBeenCalledOnceWith(reportThanks);
    expect(component.imageBase64).toBe(shown);
    expect(component.showingPlaceholder).toBeFalse();
    expect(fixture.nativeElement.querySelector('img.image')).toBeTruthy();
    expect(reportButton().disabled).toBeTrue();
  });

  it('keeps the report button disabled for the rest of this practice and enables it on a new practice', () => {
    showReportable(['https://example.com/a.jpg'], 'apple', 1);
    clickReport();
    httpMock.expectOne(environment.apiHost + '/flag-image')
      .flush({id: 1, phrase: 'apple', imageIndex: 0, count: 1});
    fixture.detectChanges();
    expect(reportButton().disabled).toBeTrue();

    fixture.componentRef.setInput('images', ['https://example.com/c.jpg']);
    fixture.componentRef.setInput('phrase', 'banana');
    fixture.detectChanges();

    expect(component.imageBase64).toBe('https://example.com/c.jpg');
    expect(fixture.nativeElement.querySelector('img.image')).toBeTruthy();
    expect(reportButton().disabled).toBeTrue();
    httpMock.expectNone(environment.apiHost + '/flag-image');

    fixture.componentRef.setInput('practiceSession', 2);
    fixture.detectChanges();
    expect(reportButton().disabled).toBeFalse();

    clickReport();
    const again = httpMock.expectOne(environment.apiHost + '/flag-image');
    expect(again.request.body).toEqual({phrase: 'banana', imageIndex: 0});
    again.flush({id: 2, phrase: 'banana', imageIndex: 0, count: 1});
    fixture.detectChanges();
    expect(ionic.showToastMessage).toHaveBeenCalledTimes(2);
    expect(fixture.nativeElement.querySelector('img.image')).toBeTruthy();
  });

  it('leaves the button enabled and the image visible when the report fails', () => {
    showReportable(['https://example.com/a.jpg'], 'apple', 1);
    const shown = component.imageBase64;
    clickReport();
    httpMock.expectOne(environment.apiHost + '/flag-image')
      .flush('nope', {status: 500, statusText: 'Server Error'});
    fixture.detectChanges();

    expect(ionic.showToastMessage).not.toHaveBeenCalled();
    expect(reportButton().disabled).toBeFalse();
    expect(component.imageBase64).toBe(shown);
    expect(fixture.nativeElement.querySelector('img.image')).toBeTruthy();
  });

  function showReportable(images: string[], phrase: string, practiceSession: number) {
    fixture.componentRef.setInput('images', images);
    fixture.componentRef.setInput('phrase', phrase);
    fixture.componentRef.setInput('canReport', true);
    fixture.componentRef.setInput('practiceSession', practiceSession);
    fixture.detectChanges();
  }

  function reportButton(): HTMLButtonElement {
    return fixture.nativeElement.querySelector('ion-button.report-image-button');
  }

  function clickReport() {
    const button = fixture.debugElement.query(By.css('ion-button.report-image-button'));
    button.triggerEventHandler('click', null);
  }

});
