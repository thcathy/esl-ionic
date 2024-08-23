import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable, of} from "rxjs";
import {TranslateService} from "@ngx-translate/core";
import {environment} from "../../../environments/environment";
import {catchError, map} from "rxjs/operators";

export interface DictionaryResult {
  word: string;
  pronunciationUrl?: string | null;
  pronunciationLang?: string;
  IPA?: string;
  definition?: string;
  meanings?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class InterpretationService {
  static languageMap: { [key: string]: string } = {
    'zh-hant': 'zt',
    'zh-hans': 'zh',
  };

  constructor(private http: HttpClient,
              private translate: TranslateService) {}

  private aiTranslateUrl = environment.interpretation.translateApiUrl;
  private googleDictionaryUrl = environment.interpretation.googleDictionaryUrl;

  isEN() {
    return this.translate.currentLang.startsWith('en');
  }

  interpret(text: string): Observable<any> {
    if (this.isEN())
      return this.getMeaning(text);
    else
      return this.aiTranslate(text);
  }

  private aiTranslate(text: string) {
    const body = {
      q: text,
      source: 'en',
      target: this.mapTargetLanguage(this.translate.currentLang),
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.post<any>(this.aiTranslateUrl, body, {headers}).pipe(
      map(response => response.translatedText),
      catchError(error => {
        console.error('Error translating text:', error);
        return of('');
      })
    );
  }

  mapTargetLanguage = (lang: string) => InterpretationService.languageMap[lang?.toLowerCase()] || lang?.toLowerCase();

  getMeaning(text: string) {
    const url = `${this.googleDictionaryUrl}/${text}`;

    return this.http.get<DictionaryResult>(url).pipe(
      map(response => this.getRandomMeaning(response.meanings, text)),
      catchError(error => {
        console.error('Error fetching meaning:', error);
        return of('');
      })
    );
  }

  private getRandomMeaning(meanings: string[], inputText: string): string {
    const filteredMeanings = meanings.filter(meaning => !meaning.includes(inputText));

    if (filteredMeanings.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredMeanings.length);
      return filteredMeanings[randomIndex];
    }

    return '';
  }
}
