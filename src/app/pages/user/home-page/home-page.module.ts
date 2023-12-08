import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomePageRoutingModule } from './home-page-routing.module';
import { HomePageComponent } from './home-page.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AboutNexComponent } from './sub-pages/about-nex/about-nex.component';
import { ViewUserComponent } from './sub-pages/view-user/view-user.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { SharingExperienceComponent } from './sub-pages/view-user/sharing-experience/sharing-experience.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { NexTeamService } from './services/nex-team.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { UserFeedsComponent } from './sub-pages/view-user/user-feeds/user-feeds.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NexTeamListComponent } from './sub-pages/about-nex/nex-team-list/nex-team-list.component';

@NgModule({
  declarations: [
    HomePageComponent,
    AboutNexComponent,
    ViewUserComponent,
    SharingExperienceComponent,
    UserFeedsComponent,
    NexTeamListComponent,
  ],
  imports: [
    CommonModule,
    HomePageRoutingModule,
    FontAwesomeModule,
    NgSelectModule,
    CarouselModule,
    SharedModule,
    ReactiveFormsModule,
  ],
  providers: [NexTeamService],
})
export class HomePageModule {}
