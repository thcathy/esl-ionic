import { Component, ViewChild } from '@angular/core';

import {Events, MenuController, Nav, NavController, Platform} from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';

import { Storage } from '@ionic/storage';

import {TranslateService} from '@ngx-translate/core';

import { LoginPage } from '../pages/login/login';
import { SignupPage } from '../pages/signup/signup';
import { TutorialPage } from '../pages/tutorial/tutorial';
import { SupportPage } from '../pages/support/support';

import { ConferenceData } from '../providers/conference-data';
import { UserData } from '../providers/user-data';
import {HomePage} from "../pages/home/home";
import {InstantDictationPage} from "../pages/instant-dictation/instant-dictation";
import {AuthService} from "../providers/auth.service";

import Auth0Cordova from '@auth0/cordova';
import {MemberHomePage} from "../pages/member-home/member-home";
import {EditDictationPage} from "../pages/edit-dictation/edit-dictation";
import {GoogleAnalytics} from "@ionic-native/google-analytics";
import {AppService} from "../providers/app.service";

export interface PageInterface {
  title: string;
  name: string;
  component: any;
  icon?: string;
  logsOut?: boolean;
  index?: number;
  tabName?: string;
  tabComponent?: any;
  iconClass?: string;
}

@Component({
  templateUrl: 'app.template.html'
})
export class ConferenceApp {
  // the root nav is a child of the root app component
  // @ViewChild(Nav) gets a reference to the app's root nav
  @ViewChild(Nav) nav: Nav;

  // List of pages that can be navigated to from the left menu
  // the left menu only works after login
  // the login page disables the left menu
  appPages: PageInterface[] = [
    { title: 'Home', name: 'HomePage', component: HomePage, icon: 'home', iconClass: 'fas fa-home' },
    //{ title: 'Schedule', name: 'TabsPage', component: TabsPage, tabComponent: SchedulePage, index: 0, icon: 'calendar' },
    //{ title: 'Speakers', name: 'TabsPage', component: TabsPage, tabComponent: SpeakerListPage, index: 1, icon: 'contacts' },
    //{ title: 'Map', name: 'TabsPage', component: TabsPage, tabComponent: MapPage, index: 2, icon: 'map' },
    //{ title: 'About', name: 'TabsPage', component: TabsPage, tabComponent: AboutPage, index: 3, icon: 'information-circle' },
    { title: 'Quick Dictation', name: 'InstantDictationPage', component: InstantDictationPage, iconClass: 'fas fa-rocket' },
  ];
  loggedInPages: PageInterface[] = [
    { title: 'My Dictation', name: 'MemberHomePage', component: MemberHomePage, iconClass: 'fas fa-list' },
    { title: 'Create Dictation', name: 'EditDictationPage', component: EditDictationPage, iconClass: 'fas fa-edit' }
  ];
  loggedOutPages: PageInterface[] = [
    { title: 'Login', name: 'LoginPage', component: LoginPage, icon: 'log-in' },
    { title: 'Support', name: 'SupportPage', component: SupportPage, icon: 'help' },
    { title: 'Signup', name: 'SignupPage', component: SignupPage, icon: 'person-add' }
  ];
  rootPage: any;
  defaultLanguage = 'en';
  languageKey = 'language';

  constructor(
    public events: Events,
    public userData: UserData,
    public menu: MenuController,
    public platform: Platform,
    public confData: ConferenceData,
    public storage: Storage,
    public splashScreen: SplashScreen,
    public translate: TranslateService,
    public authService: AuthService,
    public ga: GoogleAnalytics,
    public appService: AppService
  ) {

    // Check if the user has already seen the tutorial
    this.storage.get('hasSeenTutorial')
      .then((_hasSeenTutorial) => {
        //if (_hasSeenTutorial) {
        //  this.rootPage = HomePage;
        //} else {
        //  this.rootPage = TutorialPage;
        //}
        this.rootPage = HomePage;
        this.platformReady()
      });

    this.authService.handleAuthentication();

    this.initLanguage();

    // load the conference data
    confData.load();

    // decide which menu items should be hidden by current login status stored in local storage
    this.userData.hasLoggedIn().then((hasLoggedIn) => {
      this.enableMenu(hasLoggedIn === true);
    });
    this.enableMenu(true);

    this.listenToLoginEvents();

  }

  ngAfterViewInit(){
    this.authService.handleAuthentication();
  }

  openLoggedInPage(page: PageInterface) {
    if (!this.authService.isAuthenticated())
      this.authService.login();
    else
      this.openPage(page);
  }

  openPage(page: PageInterface) {
    let params = {};

    // the nav component was found using @ViewChild(Nav)
    // setRoot on the nav to remove previous pages and only have this page
    // we wouldn't want the back button to show in this scenario
    if (page.index) {
      params = { tabIndex: page.index };
    }

    // If we are already on tabs just change the selected tab
    // don't setRoot again, this maintains the history stack of the
    // tabs even if changing them from the menu
    if (this.nav.getActiveChildNavs().length && page.index != undefined) {
      this.nav.getActiveChildNavs()[0].select(page.index);
    } else {
      // Set the root of the nav with params if it's a tab index
      this.nav.setRoot(page.name, params).catch((err: any) => {
        console.log(`Didn't set nav root: ${err}`);
      });
    }

    if (page.logsOut === true) {
      // Give the menu time to close before changing to logged out
      this.userData.logout();
    }
  }

  openTutorial() {
    this.nav.setRoot(TutorialPage);
  }

  listenToLoginEvents() {
    this.events.subscribe('user:login', () => {
      this.enableMenu(true);
    });

    this.events.subscribe('user:signup', () => {
      this.enableMenu(true);
    });

    this.events.subscribe('user:logout', () => {
      this.enableMenu(false);
    });
  }

  enableMenu(loggedIn: boolean) {
    this.menu.enable(loggedIn, 'loggedInMenu');
    this.menu.enable(!loggedIn, 'loggedOutMenu');
  }

  platformReady() {
    // Call any initial plugins when ready
    this.platform.ready().then(() => {
      this.splashScreen.hide();

      this.ga.startTrackerWithId('UA-114755687-1')
        .then(() => {
          console.log('Google analytics is ready now');
          // Tracker is ready
          // You can now track pages or set additional information such as AppVersion or UserId
        })
        .catch(e => console.log('Error starting GoogleAnalytics', e));

      // Add this function
      (<any>window).handleOpenURL = (url) => {
        console.log(`url: ${url}`);
        debugger;
        Auth0Cordova.onRedirectUri(url);
      };
    });
  }

  isActive(page: PageInterface) {
    let childNav = this.nav.getActiveChildNavs()[0];

    // Tabs are a special case because they have their own navigation
    if (childNav) {
      if (childNav.getSelected() && childNav.getSelected().root === page.tabComponent) {
        return '#488aff';
      }
      return;
    }

    if (this.nav.getActive() && this.nav.getActive().name === page.name) {
      return '#488aff';
    }
    return;
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
    this.storage.set(this.languageKey, lang);
  }

  private initLanguage() {
    this.translate.addLangs(["en", "zh-Hans", "zh-Hant"]);
    this.translate.setDefaultLang(this.defaultLanguage);
    this.storage.get(this.languageKey).then(locale => {
      if (locale != null) this.translate.use(locale);
    });
  }

}
