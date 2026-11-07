import {VocabPracticeService} from './vocab-practice.service';
import {TestBed} from '@angular/core/testing';
import {VocabPracticeHistory} from '../../entity/vocab-practice-history';
import {vocab_apple, vocab_banana} from '../../../testing/test-data';
import {HttpClient} from '@angular/common/http';
import {Dictations, PuzzleControls} from '../../entity/dictation';
import {of, throwError} from 'rxjs';

describe('VocabPracticeService', () => {
  let service: VocabPracticeService;
  let httpClientSpy;

  beforeEach(() => {
    httpClientSpy = jasmine.createSpyObj('HttpClient', ['post', 'get']);

    TestBed.configureTestingModule({
    imports: [],
    providers: [
        VocabPracticeService,
        { provide: HttpClient, useValue: httpClientSpy },
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
      <VocabPracticeHistory>{ question: {...vocab_apple, canReportImage: true} },
      <VocabPracticeHistory>{ question: vocab_banana }
    ];
    service.saveHistory(vocabHistories1);
    const callArg = httpClientSpy.post.calls.mostRecent().args[1];
    expect(callArg.histories.length).toEqual(2);
    expect(callArg.histories[0].question.canReportImage).toBeTrue();
    expect(callArg.histories[0].question.picsFullPaths.length).toBeLessThan(1);
    expect(callArg.histories[0].question.picsFullPathsInString.length).toBeLessThan(1);
    expect(callArg.histories[0].question.grades.length).toBeLessThan(1);
  });

  it('generatePracticeFromWords create a vocabulary practice dictation', () => {
    const result = service.generatePracticeFromWords(['test']);
    expect(result.id).toEqual(-1);
    expect(result.source).toEqual(Dictations.Source.Generate);
    expect(result.showImage).toBeTruthy();
    expect(result.includeAIImage).toBeTrue();
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

  it('getQuestion requests the word without an image', () => {
    httpClientSpy.get.and.returnValue(of({ word: 'apple' }));

    service.getQuestion('apple');

    const [url, options] = httpClientSpy.get.calls.mostRecent().args;
    expect(url).toContain('/vocab/get/question/apple');
    expect(options.params.get('image')).toBe('false');
  });

  it('imageUrl can create correct url', () => {
    expect(service.imageUrl('i am ok')).toContain('images%2Fi-%2Fi-am-ok.json?alt=media');
  });

  it('flagImage POSTs phrase and imageIndex to /flag-image', () => {
    httpClientSpy.post.and.returnValue(of({id: 1, phrase: 'bus stop', imageIndex: 2, count: 1}));
    let completed = false;

    service.flagImage({phrase: 'bus stop', imageIndex: 2}).subscribe(() => completed = true);

    const [url, body] = httpClientSpy.post.calls.mostRecent().args;
    expect(url).toContain('/flag-image');
    expect(url).not.toContain('image-generation');
    expect(body).toEqual({phrase: 'bus stop', imageIndex: 2});
    expect(completed).toBeTrue();
  });

  it('getImages shows Firebase images when Include AI Image is on and ignores isVerify', (done) => {
    const cases = [
      { includeAIImage: true, isVerify: false },
      { includeAIImage: true, isVerify: true },
      { includeAIImage: undefined, isVerify: false },
    ];
    let remaining = cases.length;

    cases.forEach(({ includeAIImage, isVerify }) => {
      const practice = { word: 'unicorn', picsFullPaths: null } as any;
      httpClientSpy.get.and.returnValue(of({ images: ['img1', 'img2'], isVerify }));

      service.getImages(practice, includeAIImage).subscribe(result => {
        expect(result.picsFullPaths).toEqual(['img1', 'img2']);
        expect(result.canReportImage).toBeTrue();
        expect('imageIsVerify' in result).toBeFalse();
        expect('isVerify' in result).toBeFalse();
        remaining--;
        if (remaining === 0) {
          done();
        }
      });
    });
  });

  it('getImages hides Firebase images when Include AI Image is off, even if isVerify is true', (done) => {
    const practice = { word: 'apple', picsFullPaths: null } as any;
    httpClientSpy.get.and.returnValue(of({ images: ['img1'], isVerify: true }));

    service.getImages(practice, false).subscribe(result => {
      expect(result.picsFullPaths).toEqual([]);
      expect(result.canReportImage).toBeFalse();
      expect('imageIsVerify' in result).toBeFalse();
      expect('isVerify' in result).toBeFalse();
      done();
    });
  });

  it('getImages keeps an already valid picture and does not mark it reportable', (done) => {
    const practice = { word: 'apple', picsFullPaths: ['existing.jpg'] } as any;

    service.getImages(practice, true).subscribe(result => {
      expect(result.picsFullPaths).toEqual(['existing.jpg']);
      expect(result.canReportImage).toBeFalse();
      expect('imageIsVerify' in result).toBeFalse();
      expect(httpClientSpy.get).not.toHaveBeenCalled();
      done();
    });
  });

  it('getImages sets picsFullPaths to null on error', (done) => {
    const practice = { word: 'apple', picsFullPaths: null } as any;
    httpClientSpy.get.and.returnValue(throwError(() => new Error('network')));

    service.getImages(practice, true).subscribe(result => {
      expect(result.picsFullPaths).toBeNull();
      done();
    });
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
