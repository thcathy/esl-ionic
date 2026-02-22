import {ArticleDictationService} from './dictation/article-dictation.service';
import {TtsCloudService} from './tts-cloud.service';
import {NGXLoggerSpy} from '../../testing/mocks-ionic';

describe('TtsCloudService', () => {
  let service: TtsCloudService;
  const audioUrl = 'https://audio.funfunspell.com/a.mp3';
  const defaultVersion = 'v2';

  beforeEach(() => {
    const articleDictationService = new ArticleDictationService(NGXLoggerSpy());
    service = new TtsCloudService(NGXLoggerSpy(), articleDictationService);
  });

  function mockAudioPlay(shouldSucceed: boolean, currentTime = 0) {
    const fakeAudio: any = {
      play: shouldSucceed
        ? jasmine.createSpy().and.resolveTo(undefined)
        : jasmine.createSpy().and.rejectWith(new Error('blocked')),
      pause: jasmine.createSpy(),
      currentTime,
    };
    const audioSpy = spyOn(window as any, 'Audio').and.returnValue(fakeAudio);
    return { fakeAudio, audioSpy };
  }

  describe('text processing', () => {
    it('returns normalized text by trimming and collapsing spaces', () => {
      expect(service.normalize('  hello   world \r\n test  ')).toBe('hello world test');
    });

    it('returns punctuation text using existing punctuation behavior', () => {
      expect(service.toPunctuationText('“I don’t like this,”'))
        .toBe('double quote, I don’t like this, comma, double quote');
    });

    it('returns known SHA-256 value for hello', async () => {
      const hash = await service.sha256Hex('hello');
      expect(hash).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
    });
  });

  describe('buildCloudAudioInfo', () => {
    it('returns backend-compatible key structure', async () => {
      const info = await service.buildCloudAudioInfo('Hello world', { ttsVersion: defaultVersion });

      expect(info.key.startsWith('tts/v2/he/hello-world/')).toBeTrue();
      expect(info.key.endsWith('.mp3')).toBeTrue();
      expect(info.keyHash.length).toBe(64);
    });

    it('returns slug truncated to 40 chars', async () => {
      const info = await service.buildCloudAudioInfo('abcdefghijklmnopqrstuvwxyz1234567890LONGTAIL', { ttsVersion: defaultVersion });
      const segments = info.key.split('/');
      const slug = segments[3];

      expect(slug.length).toBe(40);
    });
  });

  describe('audio playback', () => {
    it('playCloudUrl returns true when audio plays', async () => {
      const { fakeAudio, audioSpy } = mockAudioPlay(true);

      const result = await service.playCloudUrl(audioUrl);

      expect(result).toBeTrue();
      expect(audioSpy).toHaveBeenCalledWith(audioUrl);
      expect(fakeAudio.play).toHaveBeenCalled();
    });

    it('playCloudUrl returns false on play error', async () => {
      mockAudioPlay(false);

      const result = await service.playCloudUrl(audioUrl);

      expect(result).toBeFalse();
    });

    it('stopCloudAudio pauses and resets time', async () => {
      const { fakeAudio } = mockAudioPlay(true, 10);
      await service.playCloudUrl(audioUrl);

      service.stopCloudAudio();

      expect(fakeAudio.pause).toHaveBeenCalled();
      expect(fakeAudio.currentTime).toBe(0);
    });

    it('playAudioUrl creates fresh players for repeated clicks', async () => {
      const prefetchAudio: any = { preload: '', load: jasmine.createSpy(), play: jasmine.createSpy(), pause: jasmine.createSpy(), currentTime: 0 };
      const firstPlayAudio: any = { play: jasmine.createSpy().and.resolveTo(undefined), pause: jasmine.createSpy(), currentTime: 0 };
      const secondPlayAudio: any = { play: jasmine.createSpy().and.resolveTo(undefined), pause: jasmine.createSpy(), currentTime: 0 };
      const audioSpy = spyOn(window as any, 'Audio').and.returnValues(prefetchAudio, firstPlayAudio, secondPlayAudio);

      service.prefetchAudioUrl(audioUrl);
      const first = await service.playAudioUrl(audioUrl);
      const second = await service.playAudioUrl(audioUrl);

      expect(first).toBeTrue();
      expect(second).toBeTrue();
      expect(audioSpy.calls.count()).toBe(3);
      expect(firstPlayAudio.play).toHaveBeenCalled();
      expect(secondPlayAudio.play).toHaveBeenCalled();
    });
  });
});
