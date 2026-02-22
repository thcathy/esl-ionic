import {SpeechService} from './speech.service';
import {AppServiceSpy, NGXLoggerSpy} from '../../testing/mocks-ionic';
import {UIOptionsService} from './ui-options.service';

describe('SpeechService', () => {
  let service: SpeechService;
  let ttsCloudService: jasmine.SpyObj<any>;
  let uiOptionsService: jasmine.SpyObj<any>;

  const cloudAudioInfo = {
    url: 'https://audio.funfunspell.com/tts/v2/he/hello/abc.mp3',
    key: 'tts/v2/he/hello/abc.mp3',
    processedText: 'hello',
    keyHash: 'abc',
  };

  beforeEach(() => {
    ttsCloudService = jasmine.createSpyObj('TtsCloudService', [
      'buildCloudAudioInfo',
      'playAudioUrl',
      'stopCloudAudio',
      'prefetchAudioUrl',
      'toPunctuationText',
      'normalize',
    ]);
    ttsCloudService.toPunctuationText.and.callFake((text: string) => text);
    ttsCloudService.normalize.and.callFake((text: string) => text);
    uiOptionsService = jasmine.createSpyObj('UIOptionsService', ['loadOption']);
    service = new SpeechService(AppServiceSpy(), NGXLoggerSpy(), ttsCloudService, uiOptionsService as UIOptionsService);
  });

  function stubCloudPlayback(playedByCloud: boolean) {
    ttsCloudService.buildCloudAudioInfo.and.resolveTo(cloudAudioInfo);
    ttsCloudService.playAudioUrl.and.resolveTo(playedByCloud);
  }

  describe('getVoiceMode', () => {
    it('returns online when no saved value exists', async () => {
      uiOptionsService.loadOption.and.resolveTo(null);

      const mode = await service.getVoiceMode();

      expect(mode).toBe(UIOptionsService.voiceMode.online);
    });
  });

  describe('speakByVoiceMode', () => {
    it('returns local and uses local speak when mode is local', async () => {
      const speakSpy = spyOn(service, 'speak').and.resolveTo();

      const result = await service.speakByVoiceMode('hello', { mode: UIOptionsService.voiceMode.local });

      expect(result).toBe('local');
      expect(speakSpy).toHaveBeenCalledWith('hello', 0.7);
    });

    it('uses punctuation text for local speak when speakPunctuation is true', async () => {
      const speakSpy = spyOn(service, 'speak').and.resolveTo();
      ttsCloudService.toPunctuationText.and.returnValue('hello, comma, world');
      ttsCloudService.normalize.and.returnValue('hello, comma, world');

      const result = await service.speakByVoiceMode('hello, world', {
        mode: UIOptionsService.voiceMode.local,
        speakPunctuation: true,
      });

      expect(result).toBe('local');
      expect(ttsCloudService.toPunctuationText).toHaveBeenCalledWith('hello, world');
      expect(ttsCloudService.normalize).toHaveBeenCalledWith('hello, comma, world');
      expect(speakSpy).toHaveBeenCalledWith('hello, comma, world', 0.7);
    });

    it('returns cloud when online playback succeeds', async () => {
      stubCloudPlayback(true);
      const speakSpy = spyOn(service, 'speak').and.resolveTo();

      const result = await service.speakByVoiceMode('hello', { mode: UIOptionsService.voiceMode.online });

      expect(result).toBe('cloud');
      expect(ttsCloudService.buildCloudAudioInfo).toHaveBeenCalled();
      expect(ttsCloudService.playAudioUrl).toHaveBeenCalledWith(cloudAudioInfo.url);
      expect(speakSpy).not.toHaveBeenCalled();
    });

    it('falls back to pronunciation url when online playback fails', async () => {
      stubCloudPlayback(false);
      ttsCloudService.playAudioUrl.and.returnValues(Promise.resolve(false), Promise.resolve(true));
      const speakSpy = spyOn(service, 'speak').and.resolveTo();

      const result = await service.speakByVoiceMode('hello', {
        mode: UIOptionsService.voiceMode.online,
        pronounceUrl: 'https://audio.funfunspell.com/pronounce/hello.mp3',
      });

      expect(result).toBe('cloud');
      expect(ttsCloudService.playAudioUrl.calls.count()).toBe(2);
      expect(ttsCloudService.playAudioUrl.calls.argsFor(1)).toEqual(['https://audio.funfunspell.com/pronounce/hello.mp3']);
      expect(speakSpy).not.toHaveBeenCalled();
    });

    it('falls back to local when online audio and pronounce link both fail', async () => {
      stubCloudPlayback(false);
      ttsCloudService.playAudioUrl.and.resolveTo(false);
      const speakSpy = spyOn(service, 'speak').and.resolveTo();

      const result = await service.speakByVoiceMode('hello', {
        mode: UIOptionsService.voiceMode.online,
        rate: 0.8,
        pronounceUrl: 'https://audio.funfunspell.com/pronounce/hello.mp3',
      });

      expect(result).toBe('local');
      expect(ttsCloudService.playAudioUrl.calls.count()).toBe(2);
      expect(speakSpy).toHaveBeenCalledWith('hello', 0.8);
    });

    it('uses punctuation text when falling back to local from online mode', async () => {
      stubCloudPlayback(false);
      ttsCloudService.playAudioUrl.and.resolveTo(false);
      ttsCloudService.toPunctuationText.and.returnValue('hello, comma, world');
      ttsCloudService.normalize.and.returnValue('hello, comma, world');
      const speakSpy = spyOn(service, 'speak').and.resolveTo();

      const result = await service.speakByVoiceMode('hello, world', {
        mode: UIOptionsService.voiceMode.online,
        speakPunctuation: true,
      });

      expect(result).toBe('local');
      expect(speakSpy).toHaveBeenCalledWith('hello, comma, world', 0.7);
    });
  });

  describe('prefetchByVoiceMode', () => {
    it('prefetches cloud and pronunciation audio in online mode', async () => {
      ttsCloudService.buildCloudAudioInfo.and.resolveTo(cloudAudioInfo);

      await service.prefetchByVoiceMode('hello', {
        mode: UIOptionsService.voiceMode.online,
        pronounceUrl: 'https://audio.funfunspell.com/pronounce/hello.mp3',
      });

      expect(ttsCloudService.prefetchAudioUrl.calls.count()).toBe(2);
      expect(ttsCloudService.prefetchAudioUrl.calls.argsFor(0)).toEqual(['https://audio.funfunspell.com/pronounce/hello.mp3']);
      expect(ttsCloudService.prefetchAudioUrl.calls.argsFor(1)).toEqual([cloudAudioInfo.url]);
    });
  });

  describe('stop', () => {
    it('always calls stopCloudAudio first', () => {
      const appService = (service as any).appService;
      appService.isApp.and.returnValue(false);
      (service as any).synth = jasmine.createSpyObj('speechSynthesis', ['stop']);

      service.stop();

      expect(ttsCloudService.stopCloudAudio).toHaveBeenCalled();
    });
  });
});
