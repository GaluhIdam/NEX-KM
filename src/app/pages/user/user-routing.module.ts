import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from 'src/app/core/utility/app.guard';

const routes: Routes = [
  {
    path: '',
    data: { title: 'Home', roles: ['user']},
    loadChildren: () =>
      import('./home-page/home-page.module').then(
        (m) => m.HomePageModule
      ),
    canActivate: [AuthGuard]
  },
  {
    path: 'home-page',
    data: { title: 'Home'},
    loadChildren: () =>
      import('./home-page/home-page.module').then(
        (m) => m.HomePageModule
      ),
    canActivate: [AuthGuard]
  },
  {
    path: 'dashboard-user',
    data: { title: 'Dashboard User'},
    loadChildren: () =>
      import('./dashboard-user/dashboard-user.module').then(
        (m) => m.DashboardUserModule
      ),
    canActivate: [AuthGuard]
  },

  //Routes Next Library
  {
    path: 'nex-library',
    data: { title: 'Library'},
    loadChildren: () =>
      import('./nex-library/nex-library.module').then(
        (m) => m.NexLibraryModule
      ),
    canActivate: [AuthGuard]
  },
  //Routes Next Library
  {
    path: 'nex-community',
    data: { title: 'Community'},
    loadChildren: () =>
      import('./nex-community/nex-community.module').then(
        (m) => m.NexCommunityModule
      ),
    canActivate: [AuthGuard]
  },
  //Routes Next Level
  {
    path: 'nex-level',
    data: { title: 'Level'},
    loadChildren: () =>
      import('./nex-level/nex-level.module').then(
        (m) => m.NexLevelModule
      ),
    canActivate: [AuthGuard]
  },
  //Routes Next Talks
  {
    path: 'nex-talks',
    data: { title: 'Talks'},
    loadChildren: () =>
      import('./nex-talks/nex-talks.module').then(
        (m) => m.NexTalksModule
      ),
    canActivate: [AuthGuard]
  },
  //Routes Next Learning
  {
    path: 'nex-learning',
    data: { title: 'Learning'},
    loadChildren: () =>
      import('./nex-learning/nex-learning.module').then(
        (m) => m.NexLearningModule
      ),
    canActivate: [AuthGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
