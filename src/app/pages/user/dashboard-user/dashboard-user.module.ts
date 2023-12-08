import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardUserRoutingModule } from './dashboard-user-routing.module';
import { DashboardUserComponent } from './dashboard-user.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserExperienceComponent } from './user-experience/user-experience.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { ToastrModule } from 'ngx-toastr';
import { SearchResultComponent } from './search-result/search-result.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FeedsComponent } from './feeds/feeds.component';
import { PaginationComponent } from 'src/app/components/pagination/pagination.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { PlyrModule } from 'ngx-plyr';

@NgModule({
  declarations: [
    DashboardUserComponent,
    UserExperienceComponent,
    NotificationsComponent,
    SearchResultComponent,
    FeedsComponent,
    PaginationComponent,
  ],
  imports: [
    CommonModule,
    DashboardUserRoutingModule,
    CarouselModule,
    FontAwesomeModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ToastrModule.forRoot(),
    PlyrModule,
  ],
})
export class DashboardUserModule {}
