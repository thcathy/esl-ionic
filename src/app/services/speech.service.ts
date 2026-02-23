import {Injectable} from '@angular/core';

import {AppService} from './app.service';
import {TextToSpeech} from '@capacitor-community/text-to-speech';
import {NGXLogger} from 'ngx-logger';
import {TtsCloudService} from './tts-cloud.service';
import {UIOptionsService} from './ui-options.service';

export interface SpeakOptions {
  speakPunctuation?: boolean;
  rate?: number;
  ttsVersion?: string;
  mode?: string;
  pronounceUrl?: string;
}

/**
 * Speech service: native TTS when running inside the Capacitor app (WebView);
 * Web Speech API when running in a real browser (e.g. user opened the site in Safari/Chrome).
 * On iOS Safari/Chrome, web TTS only works when speak() runs synchronously in the user gesture.
 */
@Injectable({ providedIn: 'root' })
export class SpeechService {
  synth: SpeechSynthesis | null;
  private voiceCache: SpeechSynthesisVoice | null = null;
  private voiceModeCache: string | null = null;

  constructor(
    public appService: AppService,
    private log: NGXLogger,
    private ttsCloudService: TtsCloudService,
    private uiOptionsService: UIOptionsService,
  ) {}

  async speak(text: string, rate = 0.7): Promise<void> {
    rate = Math.round(rate * 10) / 10;

    if (this.appService.isApp()) {
      await this.speakNative(text, rate);
    } else {
      this.speakWeb(text, rate);
    }
  }

  private async speakNative(text: string, rate: number): Promise<void> {
    const langs = await TextToSpeech.getSupportedLanguages();
    const lang = langs.languages.find((l) => l.startsWith('en-'));
    await TextToSpeech.stop();
    await TextToSpeech.speak({ text, lang, rate })
      .then(() => this.log.debug(`Speak by TTS: ${text}`))
      .catch((reason: unknown) => this.log.warn(JSON.stringify(reason)));
  }

  private speakWeb(text: string, rate: number): void {
    this.synth = window.speechSynthesis;
    const voice = this.getWebVoiceSync();
    const lang = voice?.lang ?? 'en-US';

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.lang = lang;
    if (voice) {
      utterance.voice = voice;
    }
    utterance.onerror = (ev: SpeechSynthesisErrorEvent) => {
      const msg = (ev as unknown as { message?: string }).message ?? String(ev.error);
      this.log.warn(`TTS error: ${ev.error}`, msg);
    };

    this.synth.cancel();
    this.synth.speak(utterance);
    this.synth.resume();
  }

  /** Preload voice and voice mode on an earlier user gesture (e.g. Start) so first speak() stays sync on iOS browser. */
  async ensureVoiceLoaded(): Promise<void> {
    if (this.appService.isApp()) {
      return;
    }
    this.synth = window.speechSynthesis;
    this.voiceCache = await this.resolveWebVoice();
    await this.getVoiceMode();
  }

  /** Warm voice-mode cache when entering a page with speak UI so speakByVoiceMode avoids await. */
  async ensureVoiceModeLoaded(): Promise<void> {
    await this.getVoiceMode();
  }

  async speakByVoiceMode(text: string, options: SpeakOptions = {}): Promise<'cloud' | 'local'> {
    const voiceMode = options.mode ?? this.voiceModeCache ?? await this.getVoiceMode();
    const rate = options.rate ?? 0.7;
    if (this.isOnlineVoiceMode(voiceMode)) {
      const cloud = await this.trySpeakCloud(text, options);
      if (cloud.playedByCloud) {
        return 'cloud';
      }
      if (options.pronounceUrl) {
        const played = await this.ttsCloudService.playAudioUrl(options.pronounceUrl);
        if (played) {
          this.log.info(`Pronunciation audio played after cloud fallback: ${options.pronounceUrl}`);
          return 'cloud';
        }
      }
      this.log.warn(`Online voice unavailable, fallback to local TTS: ${cloud.audioKey}`);
    }
    void this.speak(this.resolveLocalSpeakText(text, options), rate);
    return 'local';
  }

  async prefetchByVoiceMode(text: string, options: SpeakOptions = {}): Promise<void> {
    const voiceMode = options.mode ?? this.voiceModeCache ?? await this.getVoiceMode();
    if (!this.isOnlineVoiceMode(voiceMode)) {
      return;
    }
    if (options.pronounceUrl) {
      this.ttsCloudService.prefetchAudioUrl(options.pronounceUrl);
    }
    const cloudInfo = await this.ttsCloudService.buildCloudAudioInfo(text, {
      speakPunctuation: options.speakPunctuation,
      ttsVersion: options.ttsVersion,
    });
    this.ttsCloudService.prefetchAudioUrl(cloudInfo.url);
  }

  async getVoiceMode(): Promise<string> {
    const mode = await this.uiOptionsService.loadOption(UIOptionsService.keys.ttsVoiceMode);
    const resolved = !mode ? UIOptionsService.voiceMode.online : mode;
    this.voiceModeCache = resolved;
    return resolved;
  }

  private async trySpeakCloud(
    text: string,
    options: SpeakOptions
  ): Promise<{ playedByCloud: boolean; audioKey: string }> {
    const audioInfo = await this.ttsCloudService.buildCloudAudioInfo(text, {
      speakPunctuation: options.speakPunctuation,
      ttsVersion: options.ttsVersion,
    });
    const playedByCloud = await this.ttsCloudService.playAudioUrl(audioInfo.url);
    if (playedByCloud) {
      this.log.info(`Cloud TTS played: ${audioInfo.key}`);
    }
    return {
      playedByCloud,
      audioKey: audioInfo.key,
    };
  }

  private isOnlineVoiceMode(mode: string): boolean {
    return mode === UIOptionsService.voiceMode.online;
  }

  private resolveLocalSpeakText(text: string, options: SpeakOptions): string {
    if (!options.speakPunctuation) {
      return text;
    }
    return this.ttsCloudService.normalize(this.ttsCloudService.toPunctuationText(text));
  }

  stop(): void {
    this.ttsCloudService.stopCloudAudio();
    if (this.appService.isApp()) {
      TextToSpeech.stop().then(() => this.log.info('Stopped TTS'));
    } else if (this.synth) {
      this.synth.cancel();
    }
  }

  private getWebVoiceSync(): SpeechSynthesisVoice | null {
    if (!this.synth) {
      return null;
    }
    if (this.voiceCache) {
      return this.voiceCache;
    }
    const voices = this.synth.getVoices();
    const chosen = this.pickEnglishVoice(voices);
    if (chosen) {
      this.voiceCache = chosen;
    }
    return chosen;
  }

  private async resolveWebVoice(): Promise<SpeechSynthesisVoice | null> {
    if (!this.synth) {
      return null;
    }
    let voices = this.synth.getVoices();
    if (!voices.length) {
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          this.synth!.onvoiceschanged = null;
          resolve();
        }, 300);
        this.synth!.onvoiceschanged = () => {
          clearTimeout(timeout);
          this.synth!.onvoiceschanged = null;
          resolve();
        };
      });
      voices = this.synth.getVoices();
    }
    const chosen = this.pickEnglishVoice(voices);
    if (chosen) {
      this.voiceCache = chosen;
    }
    return chosen;
  }

  private pickEnglishVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
    if (!voices.length) {
      return null;
    }
    return (
      voices.find((v) => v.lang?.toLowerCase().startsWith('en-')) ??
      voices.find((v) => v.lang?.toLowerCase().startsWith('en')) ??
      voices[0]
    );
  }
}
