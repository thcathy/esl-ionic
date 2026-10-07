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

  it('renders one preview line at the bottom of every row', () => {
    const described = TestData.fillInDictation();
    described.description = 'Fruit words';
    described.suitableStudent = 'Kindergarten';
    const article = new TestData.DefaultSentenceDictation();
    article.id = 2;
    article.description = '   ';
    article.article = 'The cat sat.';
    component.dictations = [described, article];
    component.ngOnChanges({});
    fixture.detectChanges();

    const labels = fixture.nativeElement.querySelectorAll('#dictation-list ion-label');
    expect(labels.length).toBe(2);
    labels.forEach((label: HTMLElement) => {
      const previews = label.querySelectorAll('.preview-line');
      expect(previews.length).toBe(1);
      const heading = label.querySelector('.heading');
      expect(heading.compareDocumentPosition(previews[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(label.lastElementChild.classList.contains('preview-row')).toBeTrue();
    });
    expect(labels[0].querySelector('.preview-line').textContent.trim()).toBe('Fruit words');
    expect(labels[0].querySelector('.preview-line').getAttribute('title')).toBe('Fruit words');
    expect(labels[0].querySelector('.suitable-student-row')).not.toBeNull();
    expect(labels[0].innerHTML).toContain('3 Vocab(s)');
    expect(labels[1].querySelector('.preview-line').textContent.trim()).toBe('The cat sat.');
    expect(labels[1].innerHTML).toContain('1 Sentence');
  });

  it('still tells other screens when the list is empty', () => {
    component.dictations = [];
    component.ngOnChanges({});
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('No dictation');
    expect(fixture.nativeElement.querySelector('.no-results')).toBeNull();
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
