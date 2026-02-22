import {Injectable} from '@angular/core';

import {AppService} from './app.service';
import { TextToSpeech } from '@capacitor-community/text-to-speech';
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

@Injectable({ providedIn: 'root' })
export class SpeechService {
  synth: SpeechSynthesis | null;

  constructor(
    public appService: AppService,
    private log: NGXLogger,
    private ttsCloudService: TtsCloudService,
    private uiOptionsService: UIOptionsService,
  ) {}

  async speak(text: string, rate = 0.7) {
    rate = Math.round(rate * 10) / 10;
    console.info(`speak ${text} in speed ${rate}`);


    if (!this.appService.isIOS() && this.appService.isApp()) {
      const langs = await TextToSpeech.getSupportedLanguages();
      const lang = langs.languages.find((l) => l.startsWith('en-'));
      console.log(`lang=${lang}, langs=${JSON.stringify(langs)}`);

      if (this.appService.isIOS()) {
        rate = rate * 2;
      }

      await TextToSpeech.stop();
      await TextToSpeech.speak({
        text: text,
        lang: lang,
        rate: rate,
      })
        .then(() => this.log.debug(`Speak by tts: ${text}`))
        .catch((reason: any) => this.log.warn(JSON.stringify(reason)));
    } else {
      this.synth = window.speechSynthesis;
      const voice = await this.resolveWebVoice();
      const lang = voice?.lang || 'en-US';
      const langs = this.synth.getVoices().flatMap(v => v.lang);
      console.log(`lang=${lang}, langs=${JSON.stringify(langs)}`);

      const utterance1 = new SpeechSynthesisUtterance(text);
      utterance1.rate = rate;
      utterance1.lang = lang;
      if (voice) {
        utterance1.voice = voice;
      }
      this.synth.cancel();
      this.synth.speak(utterance1);
      this.synth.resume();
      this.log.info(`speak by web api: ${text}`);
    }
  }

  async speakByVoiceMode(text: string, options: SpeakOptions = {}): Promise<'cloud' | 'local'> {
    const voiceMode = options.mode || await this.getVoiceMode();
    const rate = options.rate ?? 0.7;
    if (this.isOnlineVoiceMode(voiceMode)) {
      const cloud = await this.trySpeakCloud(text, options);
      if (cloud.playedByCloud) {
        return 'cloud';
      }
      if (options.pronounceUrl) {
        const playedByPronounceAudio = await this.ttsCloudService.playAudioUrl(options.pronounceUrl);
        if (playedByPronounceAudio) {
          this.log.info(`Pronunciation audio played after cloud fallback: ${options.pronounceUrl}`);
          return 'cloud';
        }
      }
      this.log.warn(`Online voice unavailable, fallback to local TTS: ${cloud.audioKey}`);
    }
    await this.speak(this.resolveLocalSpeakText(text, options), rate);
    return 'local';
  }

  async prefetchByVoiceMode(text: string, options: SpeakOptions = {}) {
    const voiceMode = options.mode || await this.getVoiceMode();
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
    if (!mode) {
      return UIOptionsService.voiceMode.online;
    }
    return mode;
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

  stop() {
    this.ttsCloudService.stopCloudAudio();
    if (this.appService.isApp()) {
      TextToSpeech.stop().then(() => this.log.info(`stopped tss`));
    } else if (this.synth) {
      this.synth.cancel();
    }
  }

  private async resolveWebVoice(): Promise<SpeechSynthesisVoice | null> {
    if (!this.synth) {
      return null;
    }

    let voices = this.synth.getVoices();
    if (!voices.length) {
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          this.synth.onvoiceschanged = null;
          resolve();
        }, 300);
        this.synth.onvoiceschanged = () => {
          clearTimeout(timeout);
          this.synth.onvoiceschanged = null;
          resolve();
        };
      });
      voices = this.synth.getVoices();
    }

    if (!voices.length) {
      return null;
    }

    return voices.find(v => v.lang?.toLowerCase().startsWith('en-'))
      || voices.find(v => v.lang?.toLowerCase().startsWith('en'))
      || voices[0];
  }
}
