// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
import {NgxLoggerLevel} from 'ngx-logger';

export const environment = {
  production: false,
  logging: {
    level: NgxLoggerLevel.WARN,
  },
  apiHost: 'https://esl-rest.funfunspell.com',
  // apiHost: 'http://Timmys-MacBook-Pro.local:8380',
  maxSentenceLength: 40,
  learntVocabularyMinimumCorrect: 5,
  vocabPracticeQuestions: 3,
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
