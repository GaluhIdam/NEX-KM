import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { EbookComponent } from './sub-pages/nex-library/ebook/ebook.component';
import { DetailEbookComponent } from './sub-pages/nex-library/detail-ebook/detail-ebook.component';
import { PhotoGalleryComponent } from './sub-pages/nex-library/photo-gallery/photo-gallery.component';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { DetailPhotoComponent } from './sub-pages/nex-library/detail-photo/detail-photo.component';
import { WebDirectoryComponent } from './sub-pages/nex-library/web-directory/web-directory.component';
import { CategoryComponent } from './sub-pages/nex-library/category/category.component';
import { PointComponent } from './sub-pages/nex-level/point/point.component';
import { MerchandiseComponent } from './sub-pages/nex-level/merchandise/merchandise.component';
import { RedeemedComponent } from './sub-pages/nex-level/redeemed/redeemed.component';
import { ForumComponent } from './sub-pages/nex-talk/forum/forum.component';
import { ForumDetailComponent } from './sub-pages/nex-talk/forum-detail/forum-detail.component';
import { PodcastsComponent } from './sub-pages/nex-talk/podcasts/podcasts.component';
import { StreamComponent } from './sub-pages/nex-talk/stream/stream.component';
import { CommunityComponent } from './sub-pages/nex-community/community/community.component';
import { CommunityDetailComponent } from './sub-pages/nex-community/community-detail/community-detail.component';
import { InspirationStoryComponent } from './sub-pages/nex-learning/inspiration-story/inspiration-story.component';
import { BestPracticeComponent } from './sub-pages/nex-learning/best-practice/best-practice.component';
import { RetirementStoryComponent } from './sub-pages/nex-learning/retirement-story/retirement-story.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { AlbumCategoryDataService } from 'src/app/core/services/nex-library/album-category-data.service';
import { AlbumDataService } from 'src/app/core/services/nex-library/album-data.service';
import { AlbumGalleryDataService } from 'src/app/core/services/nex-library/album-gallery-data.service';
import { EBookCategoryDataService } from 'src/app/core/services/nex-library/ebook-category-data.service';
import { EBookDataService } from 'src/app/core/services/nex-library/ebook-data.service';
import { EBookCollectionDataService } from 'src/app/core/services/nex-library/ebook-collection-data.service';
import { EBookReviewDataService } from 'src/app/core/services/nex-library/ebook-review-data.service';
import { UnitDinasDataService } from 'src/app/core/services/nex-library/unit-dinas-data.service';
import { WebDirectoryDataService } from 'src/app/core/services/nex-library/web-directory.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { EbookCategoryComponent } from './sub-pages/nex-library/category/ebook-category/ebook-category.component';
import { PhotoGalleryCategoryComponent } from './sub-pages/nex-library/category/photo-gallery-category/photo-gallery-category.component';
import { ForumDataService } from 'src/app/core/services/nex-talk/forum-data.service';
import { CreatorPodcastComponent } from './sub-pages/nex-talk/podcasts/creator-podcast/creator-podcast.component';
import { SeriesPodcastComponent } from './sub-pages/nex-talk/podcasts/series-podcast/series-podcast.component';
import { PodcastComponent } from './sub-pages/nex-talk/podcasts/podcast/podcast.component';
import { PodcastDataService } from 'src/app/core/services/nex-talk/podcast-data.service';
import { SerieDataService } from 'src/app/core/services/nex-talk/serie-data.service';
import { CreatorDataService } from 'src/app/core/services/nex-talk/creator-data.service';
import { StreamDataService } from 'src/app/core/services/nex-talk/stream-data.service';
import { CategoryTalkComponent } from './sub-pages/nex-talk/category-talk/category-talk.component';
import { TalkCategoryDataService } from 'src/app/core/services/nex-talk/talk-category.service';
import { ArticleComponent } from './sub-pages/nex-learning/article/article.component';
import { StoryPublishComponent } from './sub-pages/nex-learning/story-publish/story-publish.component';
import { VgCoreModule } from '@videogular/ngx-videogular/core';
import { VgControlsModule } from '@videogular/ngx-videogular/controls';
import { VgOverlayPlayModule } from '@videogular/ngx-videogular/overlay-play';
import { VgBufferingModule } from '@videogular/ngx-videogular/buffering';
import { PlyrModule } from 'ngx-plyr';
import { NexLearningService } from '../user/nex-learning/nex-learning.service';
import { SoeService } from 'src/app/core/soe/soe.service';
import { NgxSummernoteModule } from 'ngx-summernote';
import { ArticleCategoryComponent } from './sub-pages/nex-learning/article-category/article-category.component';
import { ArticleEditComponent } from './sub-pages/nex-learning/article-edit/article-edit.component';
import { StoryEditComponent } from './sub-pages/nex-learning/story-edit/story-edit.component';
import { BestPracticePublishComponent } from './sub-pages/nex-learning/best-practice-publish/best-practice-publish.component';
import { CommunityCreateComponent } from './sub-pages/nex-community/community-create/community-create.component';
import { BestPracticeEditComponent } from './sub-pages/nex-learning/best-practice-edit/best-practice-edit.component';
import { MilesComponent } from './sub-pages/nex-level/miles/miles.component';
import { ConfigComponent } from './sub-pages/nex-level/config/config.component';
import { DetailRedeemedComponent } from './sub-pages/nex-level/detail-redeemed/detail-redeemed.component';
import { SliderComponent } from './sub-pages/homepage/slider/slider.component';
import { NexTeamComponent } from './sub-pages/homepage/nex-team/nex-team.component';
import { UserListComponent } from './sub-pages/homepage/user-list/user-list.component';
import { ReportComponent } from './sub-pages/homepage/report/report.component';
import { UserSharingComponent } from './sub-pages/homepage/user-sharing/user-sharing.component';
import { PointHistoryComponent } from './sub-pages/homepage/point-history/point-history.component';
import { CommunityRoleComponent } from './sub-pages/nex-community/community-role/community-role.component';
import { SliderService } from 'src/app/core/services/homepage/slider.service';
import { NexTeamService } from 'src/app/core/services/homepage/nex-team.service';
import { UserListService } from 'src/app/core/services/homepage/user-list.service';
import { SharingExperienceService } from 'src/app/core/services/homepage/sharing-experience.service';
import { ReportService } from 'src/app/core/services/homepage/report.service';
import { InterestComponent } from './sub-pages/homepage/interest/interest.component';
import { SkillComponent } from './sub-pages/homepage/skill/skill.component';
import { RolePermissionComponent } from './sub-pages/homepage/role-permission/role-permission.component';

@NgModule({
  declarations: [
    InterestComponent,
    SkillComponent,
    PointHistoryComponent,
    SliderComponent,
    NexTeamComponent,
    UserListComponent,
    UserSharingComponent,
    ReportComponent,
    RolePermissionComponent,
    EbookComponent,
    DetailEbookComponent,
    PhotoGalleryComponent,
    DetailPhotoComponent,
    WebDirectoryComponent,
    CategoryComponent,
    PointComponent,
    MerchandiseComponent,
    RedeemedComponent,
    DetailRedeemedComponent,
    MilesComponent,
    ConfigComponent,
    ForumComponent,
    ForumDetailComponent,
    PodcastsComponent,
    StreamComponent,

    //Nex Community
    CommunityComponent,
    CommunityCreateComponent,
    CommunityDetailComponent,
    CommunityRoleComponent,
    //Nex Community

    //Nex Learning
    ArticleComponent,
    ArticleEditComponent,
    ArticleCategoryComponent,

    InspirationStoryComponent,
    RetirementStoryComponent,
    StoryPublishComponent,
    StoryEditComponent,

    BestPracticeComponent,
    BestPracticeEditComponent,
    BestPracticePublishComponent,
    //Nex Learning

    EbookCategoryComponent,
    PhotoGalleryCategoryComponent,
    CreatorPodcastComponent,
    SeriesPodcastComponent,
    PodcastComponent,
    CategoryTalkComponent,
  ],
  imports: [
    FontAwesomeModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    PlyrModule,
    NgxSummernoteModule,
    CommonModule,
    AdminRoutingModule,
    FontAwesomeModule,
    NgxDropzoneModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
    SharedModule,
  ],
  providers: [
    SliderService,
    NexTeamService,
    UserListService,
    SharingExperienceService,
    ReportService,

    AlbumCategoryDataService,
    AlbumDataService,
    AlbumGalleryDataService,
    EBookCategoryDataService,
    EBookDataService,
    EBookCollectionDataService,
    EBookReviewDataService,
    UnitDinasDataService,
    WebDirectoryDataService,
    ForumDataService,
    PodcastDataService,
    SerieDataService,
    CreatorDataService,
    StreamDataService,
    TalkCategoryDataService,
    NexLearningService,
    SoeService,
  ],
})
export class AdminModule {}
