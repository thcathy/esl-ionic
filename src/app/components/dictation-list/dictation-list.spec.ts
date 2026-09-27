import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, waitForAsync} from '@angular/core/testing';
import {By} from '@angular/platform-browser';

import {SharedTestModule} from '../../../testing/shared-test.module';
import {TestData} from '../../../testing/test-data';
import {DictationListComponent} from './dictation-list';

describe('DictationListComponent', () => {
  let component: DictationListComponent;
  let fixture: ComponentFixture<DictationListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DictationListComponent ],
      imports: [
        SharedTestModule.forRoot(),
      ],
      providers: [],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DictationListComponent);
    component = fixture.componentInstance;
  });

  describe('dictations source are Select', () => {
    it('html elements display correctly', fakeAsync(() => {
      component.dictations = [TestData.selectDictation()];
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('ion-col .recommended-col')).toBeNull();
      expect(fixture.nativeElement.querySelector('ion-row .suitable-student-row')).toBeNull();
    }));
  });

  it('view passes the dictation through when openById is off', () => {
    const dictation = TestData.fillInDictation();
    component.dictations = [dictation];
    component.ngOnChanges({});
    fixture.detectChanges();

    fixture.debugElement.query(By.css('#dictation-list ion-button')).triggerEventHandler('click', null);

    expect(component.navService.pushOpenDictation).toHaveBeenCalledWith(dictation);
    expect(component.navService.openDictationById).not.toHaveBeenCalled();
  });

  it('view from search opens the dictation by id', () => {
    const dictation = TestData.fillInDictation();
    component.openById = true;
    component.dictations = [dictation];
    component.ngOnChanges({});
    fixture.detectChanges();

    fixture.debugElement.query(By.css('#dictation-list ion-button')).triggerEventHandler('click', null);

    expect(component.navService.openDictationById).toHaveBeenCalledWith(dictation.id, true);
    expect(component.navService.pushOpenDictation).not.toHaveBeenCalled();
  });

});
