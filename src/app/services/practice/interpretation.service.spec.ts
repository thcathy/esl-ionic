import {TestBed} from '@angular/core/testing';

import {InterpretationService} from './interpretation.service';
import {TranslateService} from "@ngx-translate/core";
import {HttpTestingController, provideHttpClientTesting} from "@angular/common/http/testing";
import {provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {environment} from '../../../environments/environment';

describe('InterpretationService', () => {
  let service: InterpretationService;
  let httpMock: HttpTestingController;
  let translateServiceMock: jasmine.SpyObj<TranslateService>;

  const apiUrl = environment.interpretation.apiUrl;

  beforeEach(() => {
    translateServiceMock = jasmine.createSpyObj('TranslateService', ['currentLang']);

    TestBed.configureTestingModule({
      imports: [],
      providers: [
        InterpretationService,
        {provide: TranslateService, useValue: translateServiceMock},
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ]
    });
    service = TestBed.inject(InterpretationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('targetLang', () => {
    it('maps en variants to en', () => {
      translateServiceMock.currentLang = 'en';
      expect(service.targetLang()).toBe('en');
      translateServiceMock.currentLang = 'en-US';
      expect(service.targetLang()).toBe('en');
    });

    it('maps zh-Hans to zh-Hans', () => {
      translateServiceMock.currentLang = 'zh-Hans';
      expect(service.targetLang()).toBe('zh-Hans');
    });

    it('maps zh-Hant and other zh variants to zh-Hant', () => {
      translateServiceMock.currentLang = 'zh-Hant';
      expect(service.targetLang()).toBe('zh-Hant');
      translateServiceMock.currentLang = 'zh';
      expect(service.targetLang()).toBe('zh-Hant');
    });
  });

  describe('interpret', () => {
    it('GETs the interpretation endpoint with text and lang params', () => {
      translateServiceMock.currentLang = 'zh-Hant';
      let received: string | undefined;

      service.interpret('elephant').subscribe(r => received = r);

      const req = httpMock.expectOne(r => r.url === apiUrl);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.get('text')).toBe('elephant');
      expect(req.request.params.get('lang')).toBe('zh-Hant');
      req.flush('大象');
      expect(received).toBe('大象');
    });

    it('uses lang=en when UI is English', () => {
      translateServiceMock.currentLang = 'en';

      service.interpret('elephant').subscribe();

      const req = httpMock.expectOne(r => r.url === apiUrl);
      expect(req.request.params.get('lang')).toBe('en');
      req.flush('A large mammal with tusks.');
    });

    it('returns cached value on second call without hitting the network', () => {
      translateServiceMock.currentLang = 'zh-Hans';

      service.interpret('hello').subscribe();
      const first = httpMock.expectOne(r => r.url === apiUrl);
      first.flush('你好');

      let second: string | undefined;
      service.interpret('hello').subscribe(r => second = r);
      httpMock.expectNone(r => r.url === apiUrl);
      expect(second).toBe('你好');
    });

    it('returns NO_RESULT sentinel on HTTP error', () => {
      translateServiceMock.currentLang = 'zh-Hant';
      let received: string | undefined;

      service.interpret('elephant').subscribe(r => received = r);
      const req = httpMock.expectOne(r => r.url === apiUrl);
      req.flush(null, {status: 500, statusText: 'Server Error'});
      expect(received).toBe(InterpretationService.NO_RESULT);
    });

    it('returns NO_RESULT sentinel when server returns empty body', () => {
      translateServiceMock.currentLang = 'zh-Hant';
      let received: string | undefined;

      service.interpret('elephant').subscribe(r => received = r);
      httpMock.expectOne(r => r.url === apiUrl).flush('');
      expect(received).toBe(InterpretationService.NO_RESULT);
    });

    it('keys cache by lang — same text in different lang issues a separate request', () => {
      translateServiceMock.currentLang = 'zh-Hant';
      service.interpret('elephant').subscribe();
      httpMock.expectOne(r => r.url === apiUrl && r.params.get('lang') === 'zh-Hant').flush('大象');

      translateServiceMock.currentLang = 'zh-Hans';
      let received: string | undefined;
      service.interpret('elephant').subscribe(r => received = r);
      const req = httpMock.expectOne(r => r.url === apiUrl && r.params.get('lang') === 'zh-Hans');
      req.flush('大象');
      expect(received).toBe('大象');
    });
  });
});
