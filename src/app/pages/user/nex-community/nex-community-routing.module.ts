import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NexCommunityComponent } from './nex-community.component';
import { CommunityHomeComponent } from './sub-pages/community-home/community-home.component';
import { ListActivityComponent } from './sub-pages/list-activity/list-activity.component';
import { ListMemberComponent } from './sub-pages/list-member/list-member.component';
import { ViewActivityComponent } from './sub-pages/view-activity/view-activity.component';
import { CommunityListComponent } from './sub-pages/community-list/community-list.component';
import { CommunityActivityComponent } from './sub-pages/community-activity/community-activity.component';

const routes: Routes = [
  {
    path: '',
    component: NexCommunityComponent,
  },
  {
    path: 'community',
    component: CommunityListComponent,
  },
  {
    path: 'activity-list',
    component: CommunityActivityComponent,
  },
  {
    path: ':uuid',
    component: CommunityHomeComponent,
  },
  {
    path: 'member/:uuid',
    component: ListMemberComponent,
  },
  {
    path: 'activity/:uuid',
    component: ListActivityComponent,
  },
  {
    path: 'activity-detail/:uuid/:id',
    component: ViewActivityComponent,
  },

  {
    path: 'community-home',
    component: CommunityHomeComponent,
  },
  {
    path: 'view-activity',
    component: ViewActivityComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NexCommunityRoutingModule {}
