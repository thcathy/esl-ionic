import {TestBed} from '@angular/core/testing';

import {InterpretationService} from './interpretation.service';
import {TranslateService} from "@ngx-translate/core";
import {HttpTestingController, provideHttpClientTesting} from "@angular/common/http/testing";
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';

describe('InterpretationService', () => {
  let service: InterpretationService;
  let httpMock: HttpTestingController;
  let translateServiceMock: jasmine.SpyObj<TranslateService>;

  beforeEach(() => {
    translateServiceMock = jasmine.createSpyObj('TranslateService', ['currentLang']);

    TestBed.configureTestingModule({
    imports: [],
    providers: [
        InterpretationService,
        { provide: TranslateService, useValue: translateServiceMock },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
    ]
});
    service = TestBed.inject(InterpretationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should map target language correctly', () => {
    expect(service.mapTargetLanguage('zh-Hant')).toBe('zt');
    expect(service.mapTargetLanguage('zh-Hans')).toBe('zh');
    expect(service.mapTargetLanguage('zh-hant')).toBe('zt');
    expect(service.mapTargetLanguage('zh-hans')).toBe('zh');
    expect(service.mapTargetLanguage('en')).toBe('en');
  });

  it('should call the API and return translated text', () => {
    const testText = 'Hello';
    const mockResponse = { translatedText: '你好' };
    translateServiceMock.currentLang = 'zh-hans';

    service.interpret(testText).subscribe(translatedText => {
      expect(translatedText).toBe('你好');
    });

    const req = httpMock.expectOne(service['aiTranslateUrl']);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      q: testText,
      source: 'en',
      target: 'zh',
    });
    req.flush(mockResponse);
  });

  it('should handle error and return an empty string', () => {
    translateServiceMock.currentLang = 'zh-hans';

    service.interpret('Hello').subscribe(translatedText => {
      expect(translatedText).toBe('');
    });

    const req = httpMock.expectOne(service['aiTranslateUrl']);
    req.flush(null, { status: 500, statusText: 'Server Error' });
  });

  describe('currentLang=en', () => {
    beforeEach(() => {
      translateServiceMock.currentLang = 'en';
    });

    it('should show the meaning from server', () => {
      const inputText = 'hello';
      const mockResponse = '"used as a greeting or to begin a phone conversation."';

      service.interpret(inputText).subscribe(result => {
        expect(result).toBeDefined();
        expect(result).not.toContain(inputText);
      });
      const req = httpMock.expectOne(`${service['englishMeaningUrl']}/${inputText}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });
});
