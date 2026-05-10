import {Injectable} from '@angular/core';
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable, of} from "rxjs";
import {TranslateService} from "@ngx-translate/core";
import {environment} from "../../../environments/environment";
import {catchError, map, tap} from "rxjs/operators";

export type InterpretLang = 'en' | 'zh-Hans' | 'zh-Hant';

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
    const hit = this.cache.get(key);
    if (hit !== undefined) {
      return of(hit);
    }

    const params = new HttpParams().set('text', text).set('lang', lang);
    return this.http.get(this.apiUrl, {params, responseType: 'text'}).pipe(
      map(result => result || InterpretationService.NO_RESULT),
      tap(result => this.cache.set(key, result)),
      catchError(error => {
        console.error('Error fetching interpretation:', error);
        return of(InterpretationService.NO_RESULT);
      })
    );
  }

  targetLang(): InterpretLang {
    const c = (this.translate.currentLang ?? 'en').toLowerCase();
    if (c.startsWith('en')) return 'en';
    if (c === 'zh-hans') return 'zh-Hans';
    return 'zh-Hant';
  }

  isEN(): boolean {
    return this.targetLang() === 'en';
  }
}
