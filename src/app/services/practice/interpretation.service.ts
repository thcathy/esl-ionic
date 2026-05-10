import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable, of} from "rxjs";
import {TranslateService} from "@ngx-translate/core";
import {environment} from "../../../environments/environment";
import {catchError, map} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class InterpretationService {
  static readonly NO_RESULT = '-';

  private readonly apiUrl = environment.interpretation.apiUrl;
  private readonly cache = new Map<string, string>();

  constructor(private http: HttpClient,
              private translate: TranslateService) {}

  interpret(text: string): Observable<string> {
    const lang = this.targetLang();
    const key = `${text}|${lang}`;
    const cached = this.cache.get(key);
    if (cached !== undefined) {
      return of(cached);
    }

    const params = new HttpParams().set('text', text).set('lang', lang);
    return this.http.get(this.apiUrl, {params, responseType: 'text'}).pipe(
      map(result => {
        const value = result || InterpretationService.NO_RESULT;
        this.cache.set(key, value);
        return value;
      }),
      catchError(error => {
        console.error('Error fetching interpretation:', error);
        return of(InterpretationService.NO_RESULT);
      })
    );
  }

  targetLang(): 'en' | 'zh-Hans' | 'zh-Hant' {
    const lang = (this.translate.currentLang ?? 'en').toLowerCase();
    if (lang.startsWith('en')) return 'en';
    if (lang === 'zh-hans') return 'zh-Hans';
    return 'zh-Hant';
  }

  isEN(): boolean {
    return this.targetLang() === 'en';
  }
}
