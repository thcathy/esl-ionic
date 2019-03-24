import {NgxLoggerLevel} from 'ngx-logger';

export const environment = {
  production: true,
  logging: {
    level: NgxLoggerLevel.WARN,
  },
  apiHost: 'https://esl-rest.funfunspell.com',
  maxSentenceLength: 40,
  learntVocabularyMinimumCorrect: 5,
  vocabPracticeQuestions: 10,
};
