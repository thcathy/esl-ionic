import {VocabPracticeService} from "./vocab-practice.service";
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {TestBed} from "@angular/core/testing";

describe('VocabPracticeService', () => {
  let service: VocabPracticeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        VocabPracticeService
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
