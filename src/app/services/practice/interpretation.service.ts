import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {Observable, of} from "rxjs";
import {TranslateService} from "@ngx-translate/core";
import {environment} from "../../../environments/environment";
import {catchError, map} from "rxjs/operators";

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

  private apiUrl = environment.interpretation.translateApiUrl;

  interpret(text: string): Observable<any> {
    const body = {
      q: text,
      source: 'en',
      target: this.mapTargetLanguage(this.translate.currentLang),
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.post<any>(this.apiUrl, body, { headers }).pipe(
      map(response => response.translatedText),
      catchError(error => {
        console.error('Error translating text:', error);
        return of('');
      })
    );
  }

  mapTargetLanguage = (lang: string) => InterpretationService.languageMap[lang?.toLowerCase()] || lang?.toLowerCase();
}
