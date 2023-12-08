import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NexTalksComponent } from './nex-talks.component';
import { ForumPageComponent } from './sub-pages/forum-page/forum-page.component';
import { ForumPostComponent } from './sub-pages/forum-post/forum-post.component';
import { ForumCommentsComponent } from './sub-pages/forum-comments/forum-comments.component';
import { StreamPageComponent } from './sub-pages/stream-page/stream-page.component';
import { StreamStreamingComponent } from './sub-pages/stream-streaming/stream-streaming.component';
import { PodcastPageComponent } from './sub-pages/podcast-page/podcast-page.component';
import { PodcastListDetailComponent } from './sub-pages/podcast-page/podcast-list-detail/podcast-list-detail.component';
import { PodcastMyPodcastComponent } from './sub-pages/podcast-page/podcast-my-podcast/podcast-my-podcast.component';
import { PodcastMyPodcastDetailComponent } from './sub-pages/podcast-page/podcast-my-podcast-detail/podcast-my-podcast-detail.component';
import { PodcastCreateNewSeriesComponent } from './sub-pages/podcast-create-new-series/podcast-create-new-series.component';
import { PodcastUploadPodcastComponent } from './sub-pages/podcast-upload-podcast/podcast-upload-podcast.component';
import { PodcastEditPodcastComponent } from './sub-pages/podcast-edit-podcast/podcast-edit-podcast.component';
import { PodcastEditSeriesComponent } from './sub-pages/podcast-edit-series/podcast-edit-series.component';
import { StreamPageManageComponent } from './sub-pages/stream-page-manage/stream-page-manage.component';
import { StreamPublishComponent } from './sub-pages/stream-publish/stream-publish.component';
import { StreamEditComponent } from './sub-pages/stream-edit/stream-edit.component';
import { PodcastManageComponent } from './sub-pages/podcast-page/podcast-manage/podcast-manage.component';
import { PodcastCreateCreatorComponent } from './sub-pages/podcast-create-creator/podcast-create-creator.component';
import { PodcastEditCreatorComponent } from './sub-pages/podcast-edit-creator/podcast-edit-creator.component';
import { PodcastCreatorDetailComponent } from './sub-pages/podcast-page/podcast-creator-detail/podcast-creator-detail.component';
import { PodcastSerieListComponent } from './sub-pages/podcast-page/podcast-serie-list/podcast-serie-list.component';

const routes: Routes = [
  { path: '', component: NexTalksComponent },
  // Forum
  {
    path: 'forum',
    component: ForumPageComponent,
  },
  {
    path: 'forum/post',
    component: ForumPostComponent,
  },
  {
    path: 'forum/comments/:uuid',
    component: ForumCommentsComponent,
  },
  // Stream
  {
    path: 'stream',
    component: StreamPageComponent,
  },
  {
    path: 'stream/list',
    component: StreamPageManageComponent,
  },
  {
    path: 'stream/streaming/:uuid',
    component: StreamStreamingComponent,
  },
  {
    path: 'stream/publish',
    component: StreamPublishComponent,
  },
  {
    path: 'stream/edit/:uuid',
    component: StreamEditComponent,
  },
  // Podcast
  {
    path: 'podcast',
    component: PodcastPageComponent,
    children: [
      {
        path: '',
        component: PodcastSerieListComponent,
      },
      {
        path: 'my-podcast',
        component: PodcastMyPodcastComponent,
      },
      {
        path: 'my-podcast/detail/:uuid',
        component: PodcastMyPodcastDetailComponent,
      },
      {
        path: 'list',
        component: PodcastManageComponent,
      },
      {
        path: 'list/detail/:uuid',
        component: PodcastListDetailComponent,
      },
      {
        path: 'creator/detail/:uuid',
        component: PodcastCreatorDetailComponent,
      },
    ],
  },
  {
    path: 'podcast/my-podcast/upload',
    component: PodcastUploadPodcastComponent,
  },
  {
    path: 'podcast/my-podcast/edit/:uuid',
    component: PodcastEditPodcastComponent,
  },
  {
    path: 'podcast/my-podcast/edit-series/:uuid',
    component: PodcastEditSeriesComponent,
  },
  {
    path: 'podcast/my-podcast/create-series',
    component: PodcastCreateNewSeriesComponent,
  },
  {
    path: 'podcast/my-podcast/create-creator',
    component: PodcastCreateCreatorComponent,
  },
  {
    path: 'podcast/my-podcast/edit-creator/:uuid',
    component: PodcastEditCreatorComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NexTalksRoutingModule {}
