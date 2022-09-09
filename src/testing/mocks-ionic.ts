import {of} from 'rxjs';
import {memberVocabularyMember1Apple, vocab_apple} from './test-data';


export class PlatformMock {
  public ready(): Promise<string> {
    return new Promise((resolve) => {
      resolve('READY');
    });
  }

  public getQueryParam() {
    return true;
  }

  public registerBackButtonAction(_fn: Function, _priority?: number): Function {
    return (() => true);
  }

  public hasFocus(_ele: HTMLElement): boolean {
    return true;
  }

  public doc(): HTMLDocument {
    return document;
  }

  public is(): boolean {
    return true;
  }

  public getElementComputedStyle(_container: any): any {
    return {
      paddingLeft: '10',
      paddingTop: '10',
      paddingRight: '10',
      paddingBottom: '10',
    };
  }

  public onResize(callback: any) {
    return callback;
  }

  public registerListener(_ele: any, _eventName: string, _callback: any): Function {
    return (() => true);
  }

  public win(): Window {
    return window;
  }

  public raf(_callback: any): number {
    return 1;
  }

  public timeout(callback: any, timer: number): any {
    return setTimeout(callback, timer);
  }

  public cancelTimeout(_id: any) {
    // do nothing
  }

  public getActiveElement(): any {
    return document['activeElement'];
  }
}

export class NavMock {

  public pop(): any {
    return new Promise(function(resolve: Function): void {
      resolve();
    });
  }

  public push(): any {
    return new Promise(function(resolve: Function): void {
      resolve();
    });
  }

  public getActive(): any {
    return {
      'instance': {
        'model': 'something',
      },
    };
  }

  public setRoot(): any {
    return true;
  }

  public registerChildNav(_nav: any): void {
    return ;
  }

}

export class DeepLinkerMock {

}

export const NavigationServiceSpy = () => jasmine.createSpyObj('NavigationService',
  ['goTo', 'openVocabularyStarter', 'retryDictation', 'openDictation', 'startDictation', 'openHomePage', 'getParam', 'setParam']);

export const StorageSpy = () => {
  const storageSpy = jasmine.createSpyObj('StorageService', ['get', 'set', 'remove']);
  storageSpy.get.and.callFake((param: any) => Promise.resolve());
  return storageSpy;
};

export const NGXLoggerSpy = () => jasmine.createSpyObj('NGXLogger', ['info', 'warn', 'error', 'debug']);

export const LoadingSpy = () => jasmine.createSpyObj('Loading', ['dismiss', 'present']);

export const LoadingControllerSpy = () => {
  const loadingControllerSpy = jasmine.createSpyObj('LoadingController', ['create']);
  loadingControllerSpy.create.and.returnValue(Promise.resolve(LoadingSpy()));
  return loadingControllerSpy;
};

export const AlertControllerSpy = () => jasmine.createSpyObj('AlertController', ['create']);

export const FFSAuthServiceSpy = () => jasmine.createSpyObj('FFSAuthService', ['requireAuthenticated', 'isAuthenticated', 'handleAuthCallbackWeb']);

export const PopoverControllerSpy = () => jasmine.createSpyObj('PopoverController', ['create']);

export const ToastControllerSpy = () => jasmine.createSpyObj('ToastController', ['create']);

export const SplashScreenSpy = () => jasmine.createSpyObj('SplashScreen', ['hide']);

export const PlatformSpy = () => jasmine.createSpyObj('Platform', { ready: Promise.resolve() });

export const TextToSpeechSpy = () => jasmine.createSpyObj('TextToSpeech', ['speak']);

export const DictationServiceSpy = () => jasmine.createSpyObj('DictationService',
  ['createVocabDictationHistory', 'isInstantDictation', 'isSentenceDictation', 'getById']
);

export const VocabPracticeServiceSpy = () => {
  const spy = jasmine.createSpyObj('VocabPracticeService', ['saveHistory', 'generatePractice', 'getQuestion', 'getImages']);
  spy.saveHistory.and.returnValue(of(''));
  spy.generatePractice.and.returnValue(of(''));
  spy.getQuestion.and.returnValue(of(vocab_apple));
  spy.getImages.and.callFake((param: any) => of(param));
  return spy;
};

export const ManageVocabHistoryServiceSpy = () => {
  const spy = jasmine.createSpyObj('ManageVocabHistoryService',
    [
      'classifyVocabulary', 'findMemberVocabulary', 'isLearnt'
    ]);
  spy.findMemberVocabulary.and.returnValue(memberVocabularyMember1Apple());
  return spy;
};

export const AppServiceSpy = () => jasmine.createSpyObj('AppService', ['isApp']);

export const SpeechServiceSpy = () => jasmine.createSpyObj('SpeechServiceSpy', ['speak']);

export const IonicComponentServiceSpy = () => jasmine.createSpyObj('IonicComponentServiceSpy', ['presentVocabPracticeTypeActionSheet']);

export const MemberDictationServiceSpy = () => {
  const spy = jasmine.createSpyObj('MemberDictationService', ['createOrAmendDictation']);
  spy.createOrAmendDictation.and.returnValue(of());
  return spy;
};
