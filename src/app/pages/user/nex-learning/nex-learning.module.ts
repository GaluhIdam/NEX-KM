import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NexLearningRoutingModule } from './nex-learning-routing.module';
import { NexLearningComponent } from './nex-learning.component';
import { ArticleComponent } from './sub-pages/article/article.component';
import { InspirationalStoryComponent } from './sub-pages/inspirational-story/inspirational-story.component';
import { RetirementStoryComponent } from './sub-pages/retirement-story/retirement-story.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BestPracticeComponent } from './sub-pages/best-practice/best-practice.component';
import { ArticleViewComponent } from './sub-pages/article-view/article-view.component';
import { ArticlePublishComponent } from './sub-pages/article-publish/article-publish.component';
import { NgxSummernoteModule } from 'ngx-summernote';
import { VgCoreModule } from '@videogular/ngx-videogular/core';
import { VgControlsModule } from '@videogular/ngx-videogular/controls';
import { VgOverlayPlayModule } from '@videogular/ngx-videogular/overlay-play';
import { VgBufferingModule } from '@videogular/ngx-videogular/buffering';
import { PlyrModule } from 'ngx-plyr';
import { NexLearningService } from './nex-learning.service';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SoeService } from 'src/app/core/soe/soe.service';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { ArticleCategoryComponent } from './sub-pages/article-category/article-category.component';
import { ArticleManagementComponent } from './sub-pages/article-management/article-management.component';
import { SharedModule } from "../../../shared/shared.module";
import { ArticleEditComponent } from './sub-pages/article-edit/article-edit.component';
import { StoryViewComponent } from './sub-pages/story-view/story-view.component';
import { BestPracticeViewComponent } from './sub-pages/best-practice-view/best-practice-view.component';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  declarations: [
    NexLearningComponent,
    ArticleComponent,
    ArticleCategoryComponent,
    ArticleManagementComponent,
    ArticleEditComponent,
    InspirationalStoryComponent,
    RetirementStoryComponent,
    StoryViewComponent,
    BestPracticeComponent,
    BestPracticeViewComponent,
    ArticleViewComponent,
    ArticlePublishComponent,
  ],
  providers: [NexLearningService, SoeService],
  imports: [
    CommonModule,
    FontAwesomeModule,
    CarouselModule,
    NexLearningRoutingModule,
    NgxSummernoteModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    PlyrModule,
    ReactiveFormsModule,
    FormsModule,
    NgMultiSelectDropDownModule.forRoot(),
    NgxDropzoneModule,
    SharedModule,
    NgSelectModule,
  ],
})
export class NexLearningModule { }
