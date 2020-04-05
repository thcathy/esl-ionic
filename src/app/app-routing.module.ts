import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MemberHomePage} from "./pages/member-home/member-home.page";

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('./home/home.module').then(m => m.HomePageModule) },
  { path: 'instant-dictation', loadChildren: () => import('./pages/instant-dictation/instant-dictation.module').then(m => m.InstantDictationPageModule) },
  { path: 'dictation-practice', loadChildren: () => import('./pages/dictation-practice/dictation-practice.module').then(m => m.DictationPracticePageModule) },
  { path: 'practice-complete', loadChildren: () => import('./pages/practice-complete/practice-complete.module').then(m => m.PracticeCompletePageModule) },
  { path: 'article-dictation', loadChildren: () => import('./pages/article-dictation/article-dictation.module').then(m => m.ArticleDictationPageModule) },
  { path: 'article-dictation-complete', loadChildren: () => import('./pages/article-dictation-complete/article-dictation-complete.module').then(m => m.ArticleDictationCompletePageModule) },
  { path: 'dictation-view', loadChildren: () => import('./pages/dictation-view/dictation-view.module').then(m => m.DictationViewPageModule) },
  { path: 'link/dictation-view', loadChildren: () => import('./pages/dictation-view/dictation-view.module').then(m => m.DictationViewPageModule) },
  { path: 'dictation-view/:dictationId', loadChildren: () => import('./pages/dictation-view/dictation-view.module').then(m => m.DictationViewPageModule) },
  { path: 'link/dictation-view/:dictationId', loadChildren: () => import('./pages/dictation-view/dictation-view.module').then(m => m.DictationViewPageModule) },
  { path: 'account', loadChildren: () => import('./pages/account/account.module').then(m => m.AccountPageModule) },
  { path: 'member-home/:segment', loadChildren: () => import('./pages/member-home/member-home.module').then(m => m.MemberHomePageModule) },
  { path: 'edit-dictation', loadChildren: () => import('./pages/edit-dictation/edit-dictation.module').then(m => m.EditDictationPageModule) },
  { path: 'search-dictation', loadChildren: () => import('./pages/search-dictation/search-dictation.module').then(m => m.SearchDictationPageModule) },
  { path: 'vocabulary-starter', loadChildren: () => import('./pages/vocabulary-starter/vocabulary-starter.module').then(m => m.VocabularyStarterPageModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
