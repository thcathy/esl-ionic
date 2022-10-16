import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, tick, waitForAsync} from '@angular/core/testing';

import {SharedTestModule} from '../../../testing/shared-test.module';
import {DictationCardComponent} from './dictation-card';
import {TestData} from '../../../testing/test-data';
import {ManageVocabHistoryServiceSpy} from '../../../testing/mocks-ionic';
import {ManageVocabHistoryService} from '../../services/member/manage-vocab-history.service';

describe('DictationCardComponent', () => {
  let component: DictationCardComponent;
  let fixture: ComponentFixture<DictationCardComponent>;
  let manageVocabHistoryServiceSpy;

  beforeEach(waitForAsync(() => {
    manageVocabHistoryServiceSpy = ManageVocabHistoryServiceSpy();

    TestBed.configureTestingModule({
      declarations: [ DictationCardComponent ],
      imports: [
        SharedTestModule.forRoot(),
      ],
      providers: [
        { provide: ManageVocabHistoryService, useValue: manageVocabHistoryServiceSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DictationCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('dictation source is FillIn', () => {
    it('html elements display correctly', fakeAsync(() => {
      component.dictation = TestData.fillInDictation();
      component.edit = true;
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('ion-card-header .dictation')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('ion-card-header .vocabulary')).toBeNull();
      expect(fixture.nativeElement.querySelector('ion-card-content .descriptionTR')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('ion-card-content .suitableTR')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('ion-card-content .recommendTR')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('ion-card-content .fillin-vocabs')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('ion-card-content .share-button')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('ion-card-content .edit-button')).toBeTruthy();
    }));
  });

  describe('dictation source is Select', () => {
    beforeEach(() => {
      component.dictation = TestData.selectDictation();
      fixture.detectChanges();
    });

    it('html elements display correctly', fakeAsync(() => {
      expect(fixture.nativeElement.querySelector('ion-card-header .dictation')).toBeNull();
      expect(fixture.nativeElement.querySelector('ion-card-header .vocabulary')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('ion-card-content .descriptionTR')).toBeNull();
      expect(fixture.nativeElement.querySelector('ion-card-content .suitableTR')).toBeNull();
      expect(fixture.nativeElement.querySelector('ion-card-content .recommendTR')).toBeNull();
      expect(fixture.nativeElement.querySelector('ion-card-content .select-vocab-list')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('ion-card-content .share-button')).toBeNull();
      expect(fixture.nativeElement.querySelector('ion-card-content .edit-button')).toBeNull();
    }));

    it('if the vocab is learnt will show badge', fakeAsync(() => {
      manageVocabHistoryServiceSpy.isLearnt.and.returnValue(true);
      component.dictation = TestData.selectDictation();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.select-vocab-list ion-badge')).toBeTruthy();
    }));
  });

  describe('sentence dictation', () => {
    beforeEach(() => {
      component.dictation = new TestData.DefaultSentenceDictation();
      fixture.detectChanges();
    });

    it('show options', fakeAsync(() => {
      component.articleDictationOptionsModal = jasmine.createSpyObj('NGXLogger', ['present']);
      component.showDictationOptions();
      expect(component.articleDictationOptionsModal.present).toHaveBeenCalled();
    }));
  });

});
