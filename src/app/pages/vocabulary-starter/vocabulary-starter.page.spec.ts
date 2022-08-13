import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import {VocabularyStarterPage, VocabularyStarterPageInput} from './vocabulary-starter.page';
import {SharedTestModule} from '../../../testing/shared-test.module';
import {ActivatedRoute} from '@angular/router';
import {Observable, of} from 'rxjs';
import {StorageSpy, VocabPracticeServiceSpy} from '../../../testing/mocks-ionic';
import {VocabPracticeService} from '../../services/practice/vocab-practice.service';
import {Storage} from '@ionic/storage-angular';
import {VocabDifficulty} from '../../entity/voacb-practice';
import {VocabPracticeType} from '../../enum/vocab-practice-type.enum';
import {dictation1} from '../../../testing/test-data';
import { StorageService } from '../../services/storage.service';

describe('VocabularyStarterPage', () => {
  let component: VocabularyStarterPage;
  let fixture: ComponentFixture<VocabularyStarterPage>;
  let route: ActivatedRoute;
  let vocabPracticeServiceSpy, storageSpy;

  beforeEach(async(() => {
    vocabPracticeServiceSpy = VocabPracticeServiceSpy();
    storageSpy = StorageSpy();
    route = new ActivatedRoute();
    route.params = of();

    TestBed.configureTestingModule({
      declarations: [ VocabularyStarterPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      imports: [
        SharedTestModule.forRoot(),
      ],
      providers: [
        { provide: ActivatedRoute, useValue: route },
        { provide: VocabPracticeService, useValue: vocabPracticeServiceSpy},
        { provide: StorageService, useValue: storageSpy },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VocabularyStarterPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
    vocabPracticeServiceSpy.generatePractice.and.returnValue(of(dictation1));
  });

  it('input are stored when submit and load when enter page', fakeAsync(() => {
    const params = { 'VocabularyStarterPage.vocabularyStarterPageInput': <VocabularyStarterPageInput>{
      difficulty: VocabDifficulty.Hard,
      type: VocabPracticeType.Spell
    }};
    storageSpy.get.and.callFake((param) => params[param]);
    component.ionViewWillEnter();
    tick();
    expect(component.difficulty.value).toEqual(VocabDifficulty.Hard);
    expect(component.type.value).toEqual(VocabPracticeType.Spell);

    component.difficulty.setValue(VocabDifficulty.Normal);
    component.type.setValue(VocabPracticeType.Puzzle);
    component.start();
    tick();
    const storedArg = <VocabularyStarterPageInput> storageSpy.set.calls.mostRecent().args[1];
    expect(storageSpy.set.calls.mostRecent().args[0]).toEqual(component.inputKey);
    expect(storedArg.difficulty).toEqual(VocabDifficulty.Normal);
    expect(storedArg.type).toEqual(VocabPracticeType.Puzzle);
  }));

});
