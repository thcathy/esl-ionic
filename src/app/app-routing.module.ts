import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {MemberHomePage} from "./pages/member-home/member-home.page";

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: './home/home.module#HomePageModule' },
  { path: 'instant-dictation', loadChildren: './pages/instant-dictation/instant-dictation.module#InstantDictationPageModule' },
  { path: 'dictation-practice', loadChildren: './pages/dictation-practice/dictation-practice.module#DictationPracticePageModule' },
  { path: 'practice-complete', loadChildren: './pages/practice-complete/practice-complete.module#PracticeCompletePageModule' },
  { path: 'article-dictation', loadChildren: './pages/article-dictation/article-dictation.module#ArticleDictationPageModule' },
  { path: 'article-dictation-complete', loadChildren: './pages/article-dictation-complete/article-dictation-complete.module#ArticleDictationCompletePageModule' },
  { path: 'dictation-view', loadChildren: './pages/dictation-view/dictation-view.module#DictationViewPageModule' },
  { path: 'account', loadChildren: './pages/account/account.module#AccountPageModule' },
  { path: 'member-home/:segment', component: MemberHomePage },
  { path: 'edit-dictation', loadChildren: './pages/edit-dictation/edit-dictation.module#EditDictationPageModule' },
  { path: 'search-dictation', loadChildren: './pages/search-dictation/search-dictation.module#SearchDictationPageModule' },
  { path: 'vocabulary-starter', loadChildren: './pages/vocabulary-starter/vocabulary-starter.module#VocabularyStarterPageModule' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
