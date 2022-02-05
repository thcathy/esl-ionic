import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import {VocabSelectionComponent} from './vocab-selection.component';
import {SharedTestModule} from '../../../testing/shared-test.module';
import {MemberDictationServiceSpy} from '../../../testing/mocks-ionic';
import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {EditDictationRequest, MemberDictationService} from '../../services/dictation/member-dictation.service';
import {Dictations} from '../../entity/dictation';
import {memberVocabularyMember1Apple} from '../../../testing/test-data';

describe('VocabSelectionComponent', () => {
  let component: VocabSelectionComponent;
  let fixture: ComponentFixture<VocabSelectionComponent>;
  let memberDictationServiceSpy;

  beforeEach(async(() => {
    memberDictationServiceSpy = MemberDictationServiceSpy();

    TestBed.configureTestingModule({
      declarations: [ VocabSelectionComponent ],
      imports: [
        SharedTestModule.forRoot(),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: MemberDictationService, useValue: memberDictationServiceSpy },
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(VocabSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('createExercise will call createOrAmendDictation', fakeAsync(() => {
    component.createExercise();
    tick();
    const request: EditDictationRequest = memberDictationServiceSpy.createOrAmendDictation.calls.mostRecent().args[0];
    expect(request.source).toEqual(Dictations.Source.Select);
    expect(request.dictationId).toEqual(-1);
    expect(request.showImage).toBeTruthy();
    expect(request.wordContainSpace).toBeTruthy();
  }));

  it('selectVocab will activate or de-activate vocabulary', fakeAsync(() => {
    const vocab = memberVocabularyMember1Apple();
    component.selectVocab(vocab);
    fixture.detectChanges();

    expect(component.selectedVocabs.size).toBe(1);
    expect(component.selectedVocabs.has('apple')).toBeTruthy();

    component.selectVocab(vocab);
    fixture.detectChanges();
    expect(component.selectedVocabs.size).toBe(0);
    expect(component.selectedVocabs.has('apple')).toBeFalsy();
  }));
});
