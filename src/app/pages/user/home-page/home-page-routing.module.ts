import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePageComponent } from './home-page.component';
import { AboutNexComponent } from './sub-pages/about-nex/about-nex.component';
import { ViewUserComponent } from './sub-pages/view-user/view-user.component';
import { NexTeamListComponent } from './sub-pages/about-nex/nex-team-list/nex-team-list.component';
import { DashboardUserComponent } from '../dashboard-user/dashboard-user.component';

const routes: Routes = [
  { path: '', component: HomePageComponent },
  {
    path: 'about-nex',
    component: AboutNexComponent,
  },
  {
    path: 'about-nex/team-list',
    component: NexTeamListComponent,
  },
  {
    path: 'view-user/:personal_number',
    component: DashboardUserComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomePageRoutingModule {}
