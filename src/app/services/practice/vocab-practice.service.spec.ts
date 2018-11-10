import {VocabPracticeService} from "./vocab-practice.service";
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {TestBed} from "@angular/core/testing";
import {Dictation} from "../../entity/dictation";
import {VocabPracticeHistory} from "../../entity/vocab-practice-history";
import {vocab_apple, vocab_banana} from "../../../test-config/test-data";
import {CreateDictationHistoryRequest} from "../dictation/dictation.service";
import {MemberService} from "../member/member.service";
import {HttpClient} from "@angular/common/http";

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

    service = TestBed.get(VocabPracticeService);
  });

  it('isWordEqual ignore space or hyphen', () => {
    const busstop = 'busstop';
    const busstopWithHyphen = 'bus-stop';
    const busstopWithSpace = 'bus stop';
    const userInput = ['busstop','bus-stop','bus stop',' bus stop '];
    userInput.forEach(input => {
      expect(service.isWordEqual(busstop, input)).toBe(true);
      expect(service.isWordEqual(busstopWithHyphen, input)).toBe(true);
      expect(service.isWordEqual(busstopWithSpace, input)).toBe(true);
    });
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
    const callArg: VocabPracticeHistory[] = httpClientSpy.post.calls.mostRecent().args[1];
    expect(callArg.length).toEqual(2);
    expect(callArg[0].question.picsFullPaths.length).toBeLessThan(1);
    expect(callArg[0].question.picsFullPathsInString.length).toBeLessThan(1);
    expect(callArg[0].question.grades.length).toBeLessThan(1);
  });
});
