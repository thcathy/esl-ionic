import {Observable} from 'rxjs';


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

export const GoogleAnalyticsSpy = () => jasmine.createSpyObj('GoogleAnalytics',
  { trackView: Promise.resolve(), startTrackerWithId: Promise.resolve() }
);

export const NavigationServiceSpy = () => jasmine.createSpyObj('NavigationService',
  ['goTo', 'openVocabularyStarter', 'retryDictation', 'openDictation', 'startDictation', 'openHomePage']);

export const StorageSpy = () => {
  const storageSpy = jasmine.createSpyObj('Storage', ['get', 'set', 'remove']);
  storageSpy.get.and.callFake((param) => Promise.resolve());
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

export const AuthServiceSpy = () => jasmine.createSpyObj('AuthService', ['requireAuthenticated', 'isAuthenticated']);

export const PopoverControllerSpy = () => jasmine.createSpyObj('PopoverController', ['create']);

export const ToastControllerSpy = () => jasmine.createSpyObj('ToastController', ['create']);

export const StatusBarSpy = () => jasmine.createSpyObj('StatusBar', ['styleDefault']);

export const SplashScreenSpy = () => jasmine.createSpyObj('SplashScreen', ['hide']);

export const PlatformSpy = () => jasmine.createSpyObj('Platform', { ready: Promise.resolve() });

export const TextToSpeechSpy = () => jasmine.createSpyObj('TextToSpeech', ['speak']);

export const DictationServiceSpy = () => jasmine.createSpyObj('DictationService',
  ['createVocabDictationHistory', 'isInstantDictation', 'isGeneratedDictation', 'isSentenceDictation']
);

export const VocabPracticeServiceSpy = () => jasmine.createSpyObj('VocabPraticeService',
{ saveHistory: Observable.of('') }
);

export const ManageVocabHistoryServiceSpy = () => jasmine.createSpyObj('ManageVocabHistoryService', ['classifyVocabulary']);

export const AppServiceSpy = () => jasmine.createSpyObj('AppService', ['isApp']);
