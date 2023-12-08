import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NexLevelRoutingModule } from './nex-level-routing.module';
import { NexLevelComponent } from './nex-level.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MerchandiseComponent } from './sub-pages/merchandise/merchandise.component';
import { DetailMerchandiseComponent } from './sub-pages/detail-merchandise/detail-merchandise.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { PaginationComponent } from 'src/app/shared/components/pagination/pagination.component';
import { SharedModule } from "../../../shared/shared.module";

@NgModule({
    declarations: [NexLevelComponent, MerchandiseComponent, DetailMerchandiseComponent, PaginationComponent],
    imports: [
        CommonModule,
        FontAwesomeModule,
        NexLevelRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        NgxPaginationModule,
        CarouselModule,
        SharedModule
    ]
})
export class NexLevelModule { }
