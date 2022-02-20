import {NgxLoggerLevel} from 'ngx-logger';
import {baseEnv} from './base-env';

export const environment = {
  ...baseEnv,
  production: true,
  logging: {
    level: NgxLoggerLevel.WARN,
  },
  apiHost: 'https://esl-rest.funfunspell.com',
};
