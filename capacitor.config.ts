import {CapacitorConfig} from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.esl.ionic',
  appName: 'FunFunSpell',
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000
    }
  },
};

export default config;
