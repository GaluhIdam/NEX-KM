import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NexCommunityRoutingModule } from './nex-community-routing.module';
import { NexCommunityComponent } from './nex-community.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { CommunityHomeComponent } from './sub-pages/community-home/community-home.component';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { ListActivityComponent } from './sub-pages/list-activity/list-activity.component';
import { ListMemberComponent } from './sub-pages/list-member/list-member.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { ViewActivityComponent } from './sub-pages/view-activity/view-activity.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../../../shared/shared.module';
import { CommunityListComponent } from './sub-pages/community-list/community-list.component';
import { CommunityActivityComponent } from './sub-pages/community-activity/community-activity.component';

@NgModule({
  declarations: [
    NexCommunityComponent,
    CommunityHomeComponent,
    ListActivityComponent,
    ListMemberComponent,
    ViewActivityComponent,
    CommunityListComponent,
    CommunityActivityComponent,
  ],
  imports: [
    CommonModule,
    FontAwesomeModule,
    CarouselModule,
    NgxDropzoneModule,
    NexCommunityRoutingModule,
    NgSelectModule,
    ReactiveFormsModule,
    FormsModule,
    SharedModule,
  ],
})
export class NexCommunityModule {}
