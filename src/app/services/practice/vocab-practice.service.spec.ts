import {VocabPracticeService} from './vocab-practice.service';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {VocabPracticeHistory} from '../../entity/vocab-practice-history';
import {vocab_apple, vocab_banana} from '../../../testing/test-data';
import {HttpClient} from '@angular/common/http';
import {Dictation, Dictations, PuzzleControls} from '../../entity/dictation';

describe('VocabPracticeService', () => {
  let service: VocabPracticeService;
  let httpClientSpy;

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['post']);

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        VocabPracticeService,
        { provide: HttpClient, useValue: httpClientSpy},
      ]
    });

    service = TestBed.inject(VocabPracticeService);
  });

  it('isWordEqual ignore space or hyphen', () => {
    const busstop = 'busstop';
    const busstopWithHyphen = 'bus-stop';
    const busstopWithSpace = 'bus stop';
    const userInput = ['busstop', 'bus-stop', 'bus stop', ' bus stop '];
    userInput.forEach(input => {
      expect(service.isWordEqual(busstop, input)).toBe(true);
      expect(service.isWordEqual(busstopWithHyphen, input)).toBe(true);
      expect(service.isWordEqual(busstopWithSpace, input)).toBe(true);
    });
  });

  it('isWordEqual can validate include space', () => {
    expect(service.isWordEqual('bus stop', 'busstop', false)).toBe(true);
    expect(service.isWordEqual('bus stop', 'busstop', true)).toBe(false);
    expect(service.isWordEqual('bus stop', 'bus stop', true)).toBe(true);
  });

  it('isWordEqual is case insensitive', () => {
    const busstop = 'busstop';

    expect(service.isWordEqual(busstop, 'Busstop')).toBe(true);
    expect(service.isWordEqual(busstop, 'Bus-Stop')).toBe(true);
    expect(service.isWordEqual(busstop, 'BUS STOP')).toBe(true);
  });

  it('save history should trim the input before sending out', () => {
    const vocabHistories1 = [
      <VocabPracticeHistory>{ question: vocab_apple },
      <VocabPracticeHistory>{ question: vocab_banana }
    ];

    service.saveHistory(vocabHistories1);
    const callArg = httpClientSpy.post.calls.mostRecent().args[1];
    expect(callArg.histories.length).toEqual(2);
    expect(callArg.histories[0].question.picsFullPaths.length).toBeLessThan(1);
    expect(callArg.histories[0].question.picsFullPathsInString.length).toBeLessThan(1);
    expect(callArg.histories[0].question.grades.length).toBeLessThan(1);
  });

  it('generatePracticeFromWords create a vocabulary practice dictation', () => {
    const result = service.generatePracticeFromWords(['test']);
    expect(result.id).toEqual(-1);
    expect(result.source).toEqual(Dictations.Source.Generate);
    expect(result.showImage).toBeTruthy();
    expect(result.vocabs.length).toEqual(1);
    expect(result.vocabs[0].word).toEqual('test');
    expect(result.source).toEqual(Dictations.Source.Generate);
  });

  it('createPuzzleControls create a new object for new word', () => {
    const result = service.createPuzzleControls('banana');
    expect(result.word).toEqual('banana');
    expect(result.buttons.length).toEqual(8);
    expect(result.buttonCorrects.length).toEqual(8);
    expect(result.buttonCorrects.filter(c => c).length).toEqual(1);
    expect(result.answers.length).toEqual(6);
    expect(result.answers[0]).toEqual('_');
    expect(result.answers.filter(a => a === '?').length).toEqual(5);
  });

  describe('test receiveAnswer', () => {
    let controls: PuzzleControls;

    beforeEach(() => {
      controls = service.createPuzzleControls('banana');
    });

    it('update controls when receive first answer', () => {
      service.receiveAnswer(controls, 'b');
      expect(controls.counter).toEqual(1);
      expect(controls.answers[0]).toEqual('b');
      expect(controls.answers[1]).toEqual('_');
      expect(controls.answers.filter(a => a === '?').length).toEqual(4);
      const button = controls.buttons[controls.buttonCorrects.findIndex(c => c)];
      expect(button).toEqual(controls.word.charAt(controls.counter));
    });

    it('counter will not larger than length of word', () => {
      controls = service.createPuzzleControls('on');
      service.receiveAnswer(controls, 'o');
      service.receiveAnswer(controls, 'n');
      service.receiveAnswer(controls, 'x');
      expect(controls.counter).toEqual(2);
      expect(controls.answers.join('')).toEqual('on');
      expect(controls.isComplete()).toBeTrue();
      expect(controls.buttonCorrects.every(v => !v)).toBeTrue();
    });

  });
});
