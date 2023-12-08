import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NexTalksRoutingModule } from './nex-talks-routing.module';
import { NexTalksComponent } from './nex-talks.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { NgxSummernoteModule } from 'ngx-summernote';
import { ForumPageComponent } from './sub-pages/forum-page/forum-page.component';
import { ForumPostComponent } from './sub-pages/forum-post/forum-post.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { ForumCommentsComponent } from './sub-pages/forum-comments/forum-comments.component';
import { StreamPageComponent } from './sub-pages/stream-page/stream-page.component';
import { StreamFavoritesComponent } from './sub-pages/stream-favorites/stream-favorites.component';
import { StreamTrendingComponent } from './sub-pages/stream-page-manage/stream-trending/stream-trending.component';
import { StreamEditorChoisesComponent } from './sub-pages/stream-page-manage/stream-editor-choises/stream-editor-choises.component';
import { StreamStreamingComponent } from './sub-pages/stream-streaming/stream-streaming.component';
import { VgCoreModule } from '@videogular/ngx-videogular/core';
import { VgControlsModule } from '@videogular/ngx-videogular/controls';
import { VgOverlayPlayModule } from '@videogular/ngx-videogular/overlay-play';
import { VgBufferingModule } from '@videogular/ngx-videogular/buffering';
import { PodcastPageComponent } from './sub-pages/podcast-page/podcast-page.component';
import { PodcastListComponent } from './sub-pages/podcast-page/podcast-manage/podcast-list/podcast-list.component';
import { PodcastLatestReleaseComponent } from './sub-pages/podcast-page/podcast-manage/podcast-latest-release/podcast-latest-release.component';
import { PodcastRecentlyPlayedComponent } from './sub-pages/podcast-page/podcast-manage/podcast-recently-played/podcast-recently-played.component';
import { PodcastLikedPodcastComponent } from './sub-pages/podcast-page/podcast-manage/podcast-liked-podcast/podcast-liked-podcast.component';
import { PodcastListDetailComponent } from './sub-pages/podcast-page/podcast-list-detail/podcast-list-detail.component';
import { PlyrModule } from 'ngx-plyr';
import { PodcastMyPodcastComponent } from './sub-pages/podcast-page/podcast-my-podcast/podcast-my-podcast.component';
import { PodcastMyPodcastDetailComponent } from './sub-pages/podcast-page/podcast-my-podcast-detail/podcast-my-podcast-detail.component';
import { PodcastCreateNewSeriesComponent } from './sub-pages/podcast-create-new-series/podcast-create-new-series.component';
import { PodcastUploadPodcastComponent } from './sub-pages/podcast-upload-podcast/podcast-upload-podcast.component';
import { PodcastEditPodcastComponent } from './sub-pages/podcast-edit-podcast/podcast-edit-podcast.component';
import { PodcastEditSeriesComponent } from './sub-pages/podcast-edit-series/podcast-edit-series.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { StreamPageManageComponent } from './sub-pages/stream-page-manage/stream-page-manage.component';
import { StreamUserComponent } from './sub-pages/stream-page-manage/stream-user/stream-user.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { StreamPublishComponent } from './sub-pages/stream-publish/stream-publish.component';
import { StreamEditComponent } from './sub-pages/stream-edit/stream-edit.component';
import { ForumCommentDataService } from 'src/app/core/services/nex-talk/forum-comment-data.service';
import { ForumDataService } from 'src/app/core/services/nex-talk/forum-data.service';
import { PodcastDataService } from 'src/app/core/services/nex-talk/podcast-data.service';
import { SerieDataService } from 'src/app/core/services/nex-talk/serie-data.service';
import { CreatorDataService } from 'src/app/core/services/nex-talk/creator-data.service';
import { StreamDataService } from 'src/app/core/services/nex-talk/stream-data.service';
import { TalkCategoryDataService } from 'src/app/core/services/nex-talk/talk-category.service';
import { PodcastManageComponent } from './sub-pages/podcast-page/podcast-manage/podcast-manage.component';
import { PodcastCreateCreatorComponent } from './sub-pages/podcast-create-creator/podcast-create-creator.component';
import { PodcastEditCreatorComponent } from './sub-pages/podcast-edit-creator/podcast-edit-creator.component';
import { PodcastCreatorDetailComponent } from './sub-pages/podcast-page/podcast-creator-detail/podcast-creator-detail.component';
import { PodcastSerieListComponent } from './sub-pages/podcast-page/podcast-serie-list/podcast-serie-list.component';
import { StoreModule } from '@ngrx/store';
import { podcastReducer } from './store/podcast/podcast.reducer';
import { ForumVoteDataService } from 'src/app/core/services/nex-talk/forum-vote-data.service';
import { ForumCommentLikeDataService } from 'src/app/core/services/nex-talk/forum-comment-like-data.service';
import { PodcastCollaboratorDataService } from 'src/app/core/services/nex-talk/podcast-collaborator.service';

@NgModule({
  declarations: [
    NexTalksComponent,
    ForumPageComponent,
    ForumPostComponent,
    ForumCommentsComponent,
    StreamPageComponent,
    StreamFavoritesComponent,
    StreamTrendingComponent,
    StreamEditorChoisesComponent,
    StreamStreamingComponent,
    PodcastPageComponent,
    PodcastListComponent,
    PodcastLatestReleaseComponent,
    PodcastRecentlyPlayedComponent,
    PodcastLikedPodcastComponent,
    PodcastListDetailComponent,
    PodcastMyPodcastComponent,
    PodcastMyPodcastDetailComponent,
    PodcastCreateNewSeriesComponent,
    PodcastUploadPodcastComponent,
    PodcastEditPodcastComponent,
    PodcastEditSeriesComponent,
    StreamPageManageComponent,
    StreamUserComponent,
    StreamPublishComponent,
    StreamEditComponent,
    PodcastManageComponent,
    PodcastCreateCreatorComponent,
    PodcastEditCreatorComponent,
    PodcastCreatorDetailComponent,
    PodcastSerieListComponent,
  ],
  imports: [
    CommonModule,
    NexTalksRoutingModule,
    FontAwesomeModule,
    NgxDropzoneModule,
    NgSelectModule,
    NgxSummernoteModule,
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    PlyrModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    StoreModule.forRoot({ podcast: podcastReducer }),
  ],
  providers: [
    ForumCommentDataService,
    ForumCommentLikeDataService,
    ForumVoteDataService,
    ForumDataService,
    PodcastDataService,
    PodcastCollaboratorDataService,
    SerieDataService,
    CreatorDataService,
    StreamDataService,
    TalkCategoryDataService,
  ],
})
export class NexTalksModule {}
