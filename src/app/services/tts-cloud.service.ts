import {Injectable} from '@angular/core';
import {NGXLogger} from 'ngx-logger';
import {environment} from '../../environments/environment';
import {ArticleDictationService} from './dictation/article-dictation.service';

export interface TtsCloudAudioInfo {
  url: string;
  key: string;
  processedText: string;
  keyHash: string;
}

@Injectable({ providedIn: 'root' })
export class TtsCloudService {
  private static readonly MAX_SLUG_LENGTH = 40;
  private static readonly FALLBACK_SEGMENT = '__';
  private static readonly SLUG_REPLACEMENT = '-';

  private currentAudio: HTMLAudioElement | null = null;
  private prefetchedAudioUrls: Set<string> = new Set<string>();

  constructor(
    private log: NGXLogger,
    private articleDictationService: ArticleDictationService,
  ) {}

  normalize(input: string | null | undefined): string {
    if (input == null) {
      return '';
    }
    return input
      .replace(/\r\n/g, '\n')
      .trim()
      .replace(/\s+/g, ' ');
  }

  toPunctuationText(input: string): string {
    return this.articleDictationService.replacePunctuationToWord(input, {
      speakPunctuation: true,
    });
  }

  async sha256Hex(input: string): Promise<string> {
    const data = new TextEncoder().encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const bytes = Array.from(new Uint8Array(hashBuffer));
    return bytes.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  async buildCloudAudioInfo(
    text: string,
    options: { speakPunctuation?: boolean; ttsVersion?: string } = {}
  ): Promise<TtsCloudAudioInfo> {
    const normalized = this.normalize(text);
    const processedText = options.speakPunctuation
      ? this.normalize(this.toPunctuationText(normalized))
      : normalized;
    const keyHash = await this.sha256Hex(processedText);
    const ttsVersion = options.ttsVersion || environment.ttsVersion;
    const key = this.buildAudioKey(ttsVersion, processedText, keyHash);
    return {
      url: this.buildPublicUrl(key),
      key,
      processedText,
      keyHash,
    };
  }

  stopCloudAudio() {
    if (!this.currentAudio) {
      return;
    }
    this.currentAudio.pause();
    this.currentAudio.currentTime = 0;
    this.currentAudio = null;
  }

  prefetchAudioUrl(url: string | null | undefined) {
    if (!url || this.prefetchedAudioUrls.has(url)) {
      return;
    }
    const audio = new Audio(url);
    audio.preload = 'auto';
    this.prefetchedAudioUrls.add(url);
    if (typeof audio.load === 'function') {
      audio.load();
    }
  }

  private buildAudioKey(ttsVersion: string, normalizedText: string, keyHash: string): string {
    const slug = this.sanitizeSlug(normalizedText);
    const slugMax = slug.length > TtsCloudService.MAX_SLUG_LENGTH
      ? slug.substring(0, TtsCloudService.MAX_SLUG_LENGTH)
      : slug;
    const finalSlug = slugMax.trim().length > 0 ? slugMax : TtsCloudService.FALLBACK_SEGMENT;
    const shard = finalSlug.length >= 2 ? finalSlug.substring(0, 2) : TtsCloudService.FALLBACK_SEGMENT;
    return `tts/${ttsVersion}/${shard}/${finalSlug}/${keyHash}.mp3`;
  }

  private buildPublicUrl(key: string): string {
    const base = (environment.ttsPublicBaseUrl || '').replace(/\/+$/, '');
    return `${base}/${key}`;
  }

  private sanitizeSlug(text: string): string {
    const slug = (text || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, TtsCloudService.SLUG_REPLACEMENT)
      .replace(/^-+|-+$/g, '');
    return slug.length > 0 ? slug : TtsCloudService.FALLBACK_SEGMENT;
  }

  async playAudioUrl(url: string): Promise<boolean> {
    try {
      this.stopCloudAudio();
      // Always use a fresh player instance to avoid rapid-click replay issues.
      const audio = new Audio(url);
      audio.currentTime = 0;
      this.currentAudio = audio;
      await audio.play();
      return true;
    } catch (err) {
      this.log.debug(`Audio play failed: ${url} - ${JSON.stringify(err)}`);
      this.currentAudio = null;
      return false;
    }
  }

  async playCloudUrl(url: string): Promise<boolean> {
    return this.playAudioUrl(url);
  }
}
