import {VocabPracticeService} from "./vocab-practice.service";
import {HttpClient} from "@angular/common/http";
import {TestBed} from "@angular/core/testing";

describe('VocabPracticeService', () => {
  let service: VocabPracticeService;

  beforeEach(() => {
    const spyHttpClient = jasmine.createSpyObj('HttpClient', ['']);

    TestBed.configureTestingModule({
      providers: [
        VocabPracticeService,
        { provide: HttpClient, useValue: spyHttpClient }
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
});
