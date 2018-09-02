import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

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
  { path: 'member-home', loadChildren: './pages/member-home/member-home.module#MemberHomePageModule' },
  { path: 'edit-dictation', loadChildren: './pages/edit-dictation/edit-dictation.module#EditDictationPageModule' },
  { path: 'search-dictation', loadChildren: './pages/search-dictation/search-dictation.module#SearchDictationPageModule' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
