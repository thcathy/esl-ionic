import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, fakeAsync, TestBed, waitForAsync} from '@angular/core/testing';

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

});
