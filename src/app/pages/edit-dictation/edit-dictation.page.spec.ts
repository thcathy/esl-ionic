import {CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {ComponentFixture, fakeAsync, flush, TestBed, tick} from '@angular/core/testing';

import {EditDictationPage} from './edit-dictation.page';
import {SharedTestModule} from '../../../testing/shared-test.module';
import {dictation1} from '../../../testing/test-data';
import {EditDictationRequest, MemberDictationService} from '../../services/dictation/member-dictation.service';
import {FFSAuthServiceSpy, MemberDictationServiceSpy, NavigationServiceSpy} from '../../../testing/mocks-ionic';
import {FFSAuthService} from '../../services/auth.service';
import {of} from 'rxjs';
import {NavigationService} from '../../services/navigation.service';
import {ActivatedRouteStub} from '../../../testing/activated-route-stub';
import {ActivatedRoute} from '@angular/router';
import {Dictation, Dictations} from '../../entity/dictation';
import {DictationType, EditDictationPageMode} from './edit-dictation-page-enum';
import {VocabPracticeType} from '../../enum/vocab-practice-type.enum';
import {
  ArticleDictationOptionsComponent
} from "../../components/article-dictation-options/article-dictation-options.component";
import {IonToggle} from "@ionic/angular";

describe('EditDictationPage', () => {
  let component: EditDictationPage;
  let fixture: ComponentFixture<EditDictationPage>;
  let memberDictationServiceSpy, authServiceSpy, activateRouteStub, navigationServiceSpy;

  const instantVocabDictation = <Dictation>{
    id: -1,
    showImage: false,
    vocabs: [{word: 'test'}],
    totalRecommended: 0,
    title: new Date().toDateString(),
    suitableStudent: 'Any',
  };

  beforeEach(fakeAsync(() => {
    memberDictationServiceSpy = MemberDictationServiceSpy();
    authServiceSpy = FFSAuthServiceSpy();
    activateRouteStub = new ActivatedRouteStub();
    navigationServiceSpy = NavigationServiceSpy();

    TestBed.configureTestingModule({
      declarations: [ EditDictationPage ],
      imports: [
        SharedTestModule.forRoot(),
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: MemberDictationService, useValue: memberDictationServiceSpy },
        { provide: FFSAuthService, useValue: authServiceSpy },
        { provide: ActivatedRoute, useValue: activateRouteStub },
        { provide: NavigationService, useValue: navigationServiceSpy },
      ]
    })
    .compileComponents();
  }));

  function componentViewWillEnter() {
    component.ionViewWillEnter();
    tick();
    fixture.detectChanges();
  }

  beforeEach(fakeAsync(() => {
    fixture = TestBed.createComponent(EditDictationPage);
    component = fixture.componentInstance;
    component.articleDictationOptions = TestBed.createComponent(ArticleDictationOptionsComponent).componentInstance;
    fixture.detectChanges();
    flush();
    console.log(`2. ${component.articleDictationOptions}`);
  }));

  describe('logined', () => {
    beforeEach(fakeAsync(() => {
      authServiceSpy.isAuthenticated.and.returnValue(true);
    }));

    describe('edit mode', () => {
      beforeEach(fakeAsync(() => {
        activateRouteStub.setParamMap({mode: EditDictationPageMode.Edit});
        componentViewWillEnter();
      }));

      describe('save dictation', () => {
        it('submit request then open dictation page if dictation is saved', fakeAsync(() => {
          memberDictationServiceSpy.createOrAmendDictation.and.returnValue(of(dictation1));
          componentViewWillEnter();

          component.question.setValue('apple');
          component.includeAIImage.setValue(true);
          component.saveDictation();
          tick();

          expect(component.isSaved).toBeTruthy();
          expect(component.canDeactivate()).toBeTruthy();

          const request = memberDictationServiceSpy.createOrAmendDictation.calls.mostRecent().args[0] as EditDictationRequest;
          expect(request).toBeDefined();
          expect(request.source).toEqual(Dictations.Source.FillIn);
          expect(request.includeAIImage).toBeTrue();
        }));
      });

      it('show create dictation in title in edit mode', fakeAsync(() => {
        expect(component.getTitle()).toEqual('Create Dictation');

        navigationServiceSpy.getParam.and.returnValue(dictation1);
        componentViewWillEnter();

        expect(component.getTitle()).toEqual('Create Dictation');
      }));

      it('show some of the elements in Edit mode', fakeAsync(() => {
        expect(fixture.nativeElement.querySelector('.input-form .title')).toBeTruthy();
        expect(fixture.nativeElement.querySelector('.input-form .description')).toBeTruthy();
        expect(fixture.nativeElement.querySelector('.input-form .suitableAge')).toBeTruthy();
      }));

      it('create form controls required', fakeAsync(() => {
        expect(component.title).toBeDefined();
        expect(component.description).toBeDefined();
        expect(component.suitableStudent).toBeDefined();
      }));

      it('do not show options for word', fakeAsync(() => {
        component.type.setValue(DictationType.Word);
        expect(fixture.nativeElement.querySelector('.word-options-instant')).toBeNull();
      }));

      it('show ai image toggle for word', fakeAsync(() => {
        component.type.setValue(DictationType.Word);
        expect(fixture.nativeElement.querySelector('.include-ai-image-tooltip-icon')).toBeNull();
        expect(fixture.nativeElement.querySelector('.include-ai-image-toggle')).toBeDefined();
      }));

      // this test case expected result is wrong
      it('disable ai image toggle for sentence', fakeAsync(() => {
        component.type.setValue(DictationType.Sentence);
        componentViewWillEnter();
        expect(fixture.nativeElement.querySelector('.include-ai-image-tooltip-icon')).toBeDefined();
        expect(fixture.nativeElement.querySelector('.include-ai-image-toggle')).toBeDefined();
      }));
    });
  });

  describe('without login', () => {
    beforeEach(fakeAsync(() => {
      authServiceSpy.isAuthenticated.and.returnValue(false);
    }));

    describe('instant dictation without login', () => {
      beforeEach(fakeAsync(() => {
        activateRouteStub.setParamMap({ mode: EditDictationPageMode.Start });
      }));

      it('show start dictation in title', fakeAsync(() => {
        componentViewWillEnter();
        expect(component.getTitle()).toEqual('Start Dictation');
      }));

      it('dont show some of the elements', fakeAsync(() => {
        componentViewWillEnter();

        expect(fixture.nativeElement.querySelector('.input-form .title')).toBeNull();
        expect(fixture.nativeElement.querySelector('.input-form .description')).toBeNull();
        expect(fixture.nativeElement.querySelector('.input-form .suitableAge')).toBeNull();
      }));

      it('dont not create form controls not required', fakeAsync(() => {
        componentViewWillEnter();

        expect(component.title).toBeNull();
        expect(component.description).toBeNull();
        expect(component.suitableStudent).toBeNull();
      }));

      it('setupForm will init form value from instant dictation', fakeAsync(() => {
        navigationServiceSpy.getParam.and.returnValue(instantVocabDictation);
        componentViewWillEnter();

        expect(component.showImage.value).toBeFalse();
        expect(component.question.value).toEqual('test');
        expect(component.type.value).toEqual(DictationType.Word);
      }));

      it('click preview will set the questions array and preview flag', fakeAsync(() => {
        activateRouteStub.setParamMap({ mode: EditDictationPageMode.Start });
        componentViewWillEnter();
        component.question.setValue(`apple banana cup`);
        component.type.setValue(DictationType.Word);
        component.preview();

        expect(component.isPreview).toBeTrue();
        expect(component.questions.length).toEqual(3);

        component.question.setValue(`i go to school`);
        component.type.setValue(DictationType.Sentence);
        component.sentenceLength.setValue('Long');
        component.preview();

        expect(component.isPreview).toBeTrue();
        expect(component.questions.length).toEqual(1);
      }));

      describe('start instant dictation', () => {
        beforeEach(fakeAsync(() => {
          console.log(`1. ${component.articleDictationOptions}`);
          componentViewWillEnter();
          component.articleDictationOptions = TestBed.createComponent(ArticleDictationOptionsComponent).componentInstance;
          component.articleDictationOptions.caseSensitive = TestBed.createComponent(IonToggle).componentInstance;
          component.articleDictationOptions.checkPunctuation = TestBed.createComponent(IonToggle).componentInstance;
          component.articleDictationOptions.speakPunctuation = TestBed.createComponent(IonToggle).componentInstance;
          fixture.detectChanges();
          flush();
        }));

        it('start by article will navigate to start dictation page', fakeAsync(() => {
          component.question.setValue(`This is a article.`);
          component.sentenceLength.setValue('Short');
          component.type.setValue(DictationType.Sentence);
          component.startDictationNow();

          const dictation = navigationServiceSpy.startDictation.calls.mostRecent().args[0] as Dictation;
          expect(dictation.sentenceLength).toEqual('Short');
          expect(dictation.article).toEqual('This is a article.');
          expect(dictation.source).toEqual(Dictations.Source.FillIn);
        }));

        it('start instant dictation by single word will navigate to start dictation page', fakeAsync(() => {
          component.question.setValue(`
            apple
                 banana
                     cup
          `);
          component.showImage.setValue(true);
          component.wordContainSpace.setValue(true);
          component.type.setValue(DictationType.Word);
          component.wordPracticeType.setValue(VocabPracticeType.Puzzle);
          component.startDictationNow();

          const call = navigationServiceSpy.startDictation.calls.mostRecent();
          const dictation = call.args[0] as Dictation;
          expect(dictation.showImage).toBeTrue();
          expect(dictation.wordContainSpace).toBeTrue();
          expect(dictation.vocabs.length).toEqual(3);
          expect(dictation.vocabs[0].word).toEqual('apple');
          expect(dictation.vocabs[1].word).toEqual('banana');
          expect(dictation.vocabs[2].word).toEqual('cup');
          expect(dictation.options.practiceType).toEqual(VocabPracticeType.Puzzle);
          expect(dictation.source).toEqual(Dictations.Source.FillIn);

          component.question.setValue(` apple , banana,cup`);
          component.wordContainSpace.setValue(false);
          component.startDictationNow();
          const dictation2 = navigationServiceSpy.startDictation.calls.mostRecent().args[0] as Dictation;
          expect(dictation2.vocabs.length).toEqual(3);
          expect(dictation2.vocabs[0].word).toEqual('apple');
          expect(dictation2.vocabs[1].word).toEqual('banana');
          expect(dictation2.vocabs[2].word).toEqual('cup');
        }));

        it('select dictation by word will show options for word', fakeAsync(() => {
          component.type.setValue(DictationType.Word);
          expect(fixture.nativeElement.querySelector('.word-options-instant')).toBeDefined();
          expect(fixture.nativeElement.querySelector('.word-options-all')).toBeDefined();
        }));

        it('for include AI image. show info button, not show toggle', fakeAsync(() => {
          expect(fixture.nativeElement.querySelector('.include-ai-image-tooltip-icon')).toBeDefined();
          expect(fixture.nativeElement.querySelector('.include-ai-image-toggle')).toBeNull();
        }));
      });

      describe('form validation', () => {
        beforeEach(fakeAsync(() => { componentViewWillEnter(); }));

        it('question is required', fakeAsync(() => {
          component.type.setValue(DictationType.Word);
          expect(component.question.errors.required).toBeDefined();
          component.type.setValue(DictationType.Sentence);
          expect(component.question.errors.required).toBeDefined();

          component.type.setValue(DictationType.Word);
          component.question.setValue('some english text');
          expect(component.question.errors).toBeNull();
          component.type.setValue(DictationType.Sentence);
          expect(component.question.errors).toBeNull();
        }));

        it('validate vocabulary pattern for word dictation', fakeAsync(() => {
          component.type.setValue(DictationType.Word);

          component.question.setValue('');
          expect(component.inputForm.errors).toBeNull();

          component.question.setValue('中文');
          expect(component.inputForm.errors.invalidVocabularyPattern).toBeDefined();

          component.question.setValue('without invalid text');
          expect(component.inputForm.errors).toBeNull();
        }));

        it('dont validate vocabulary pattern for sentence dictation', fakeAsync(() => {
          component.type.setValue(DictationType.Sentence);
          component.question.setValue('with invalid text !@#$$%^^');
          expect(component.question.errors).toBeDefined();
        }));

        it('word dictation cannot start with over 50 words', fakeAsync(() => {
          component.type.setValue(DictationType.Word);

          component.question.setValue('apple');
          expect(component.inputForm.errors).toBeNull();

          const apples50String = Array.from(Array(50)).map((_) => 'apple').join(' ');
          component.question.setValue(apples50String);
          expect(component.inputForm.errors).toBeNull();

          const apples51String = Array.from(Array(51)).map((_) => 'apple').join(' ');
          component.question.setValue(apples51String);
          expect(component.inputForm.errors.maxVocabulary).toBeDefined();
        }));
      });
    });
  });

});
