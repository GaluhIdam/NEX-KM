import { MerchandiseComponent } from './sub-pages/nex-level/merchandise/merchandise.component';
import { PointComponent } from './sub-pages/nex-level/point/point.component';
import { WebDirectoryComponent } from './sub-pages/nex-library/web-directory/web-directory.component';
import { DetailPhotoComponent } from './sub-pages/nex-library/detail-photo/detail-photo.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PhotoGalleryComponent } from './sub-pages/nex-library/photo-gallery/photo-gallery.component';
import { DetailEbookComponent } from './sub-pages/nex-library/detail-ebook/detail-ebook.component';
import { EbookComponent } from './sub-pages/nex-library/ebook/ebook.component';
import { CategoryComponent } from './sub-pages/nex-library/category/category.component';
import { RedeemedComponent } from './sub-pages/nex-level/redeemed/redeemed.component';
import { ForumComponent } from './sub-pages/nex-talk/forum/forum.component';
import { PodcastsComponent } from './sub-pages/nex-talk/podcasts/podcasts.component';
import { StreamComponent } from './sub-pages/nex-talk/stream/stream.component';
import { ForumDetailComponent } from './sub-pages/nex-talk/forum-detail/forum-detail.component';
import { CommunityComponent } from './sub-pages/nex-community/community/community.component';
import { CommunityDetailComponent } from './sub-pages/nex-community/community-detail/community-detail.component';
import { BestPracticeComponent } from './sub-pages/nex-learning/best-practice/best-practice.component';
import { InspirationStoryComponent } from './sub-pages/nex-learning/inspiration-story/inspiration-story.component';
import { RetirementStoryComponent } from './sub-pages/nex-learning/retirement-story/retirement-story.component';
import { CategoryTalkComponent } from './sub-pages/nex-talk/category-talk/category-talk.component';
import { AuthGuard } from 'src/app/core/utility/app.guard';
import { ArticleComponent } from './sub-pages/nex-learning/article/article.component';
import { StoryPublishComponent } from './sub-pages/nex-learning/story-publish/story-publish.component';
import { ArticleCategoryComponent } from './sub-pages/nex-learning/article-category/article-category.component';
import { ArticleEditComponent } from './sub-pages/nex-learning/article-edit/article-edit.component';
import { StoryEditComponent } from './sub-pages/nex-learning/story-edit/story-edit.component';
import { BestPracticePublishComponent } from './sub-pages/nex-learning/best-practice-publish/best-practice-publish.component';
import { CommunityCreateComponent } from './sub-pages/nex-community/community-create/community-create.component';
import { BestPracticeEditComponent } from './sub-pages/nex-learning/best-practice-edit/best-practice-edit.component';
import { DetailRedeemedComponent } from './sub-pages/nex-level/detail-redeemed/detail-redeemed.component';
import { MilesComponent } from './sub-pages/nex-level/miles/miles.component';
import { ConfigComponent } from './sub-pages/nex-level/config/config.component';
import { SliderComponent } from './sub-pages/homepage/slider/slider.component';
import { NexTeamComponent } from './sub-pages/homepage/nex-team/nex-team.component';
import { UserListComponent } from './sub-pages/homepage/user-list/user-list.component';
import { ReportComponent } from './sub-pages/homepage/report/report.component';
import { UserSharingComponent } from './sub-pages/homepage/user-sharing/user-sharing.component';
import { DetailUserComponent } from './sub-pages/homepage/detail-user/detail-user.component';
import { PointHistoryComponent } from './sub-pages/homepage/point-history/point-history.component';
import { CommunityRoleComponent } from './sub-pages/nex-community/community-role/community-role.component';
import { InterestComponent } from './sub-pages/homepage/interest/interest.component';
import { SkillComponent } from './sub-pages/homepage/skill/skill.component';
import { RolePermissionComponent } from './sub-pages/homepage/role-permission/role-permission.component';

const routes: Routes = [
  {
    path: '',
    data: { roles: ['admin'] },
    component: EbookComponent,
    canActivate: [AuthGuard],
  },

  //Router HomePage
  {
    path: 'slider',
    data: { title: 'Slider' },
    component: SliderComponent,
  },

  {
    path: 'interest',
    data: { title: 'Interest' },
    component: InterestComponent,
  },

  {
    path: 'skill',
    data: { title: 'Skill' },
    component: SkillComponent,
  },

  {
    path: 'nex-team',
    data: { title: 'Nex Team' },
    component: NexTeamComponent,
  },
  {
    path: 'user-list',
    data: { title: 'User List' },
    component: UserListComponent,
  },
  {
    path: 'user-list/detail',
    data: { title: 'Detail User' },
    component: DetailUserComponent,
  },
  {
    path: 'user-list/detail/point-history',
    data: { title: 'Point History' },
    component: PointHistoryComponent,
  },
  {
    path: 'sharing-experience',
    data: { title: 'Sharing Experience' },
    component: UserSharingComponent,
  },
  {
    path: 'report',
    data: { title: 'Report' },
    component: ReportComponent,
  },
  {
    path: 'role-permission',
    data: { title: 'Role & Permission' },
    component: RolePermissionComponent,
  },

  //Route Nex Library
  { path: 'ebook', data: { title: 'E-Books' }, component: EbookComponent },
  {
    path: 'ebook/:uuid',
    data: { title: 'E-Books' },
    component: DetailEbookComponent,
  },
  {
    path: 'photo-gallery',
    data: { title: 'Photo Gallery' },
    component: PhotoGalleryComponent,
  },
  {
    path: 'photo-gallery/:uuid',
    data: { title: 'Photo Gallery' },
    component: DetailPhotoComponent,
  },
  {
    path: 'web-directory',
    data: { title: 'Web Directory' },
    component: WebDirectoryComponent,
  },
  {
    path: 'category-library',
    data: { title: 'Categories' },
    component: CategoryComponent,
  },
  //Route Nex Level
  { path: 'point', data: { title: 'Point' }, component: PointComponent },
  {
    path: 'merchandise',
    data: { title: 'Merchandise' },
    component: MerchandiseComponent,
  },
  {
    path: 'redeemed',
    data: { title: 'Redeemed' },
    component: RedeemedComponent,
  },
  {
    path: 'redeemed/detail/:uuid',
    data: { title: 'Redeemed Detail' },
    component: DetailRedeemedComponent,
  },
  {
    path: 'miles',
    data: { title: 'Miles' },
    component: MilesComponent,
  },
  {
    path: 'point-config',
    data: { title: 'Point Config' },
    component: ConfigComponent,
  },
  //Route Nex Talk
  { path: 'forum', data: { title: 'Forum' }, component: ForumComponent },
  {
    path: 'forum/:uuid',
    data: { title: 'Forum' },
    component: ForumDetailComponent,
  },
  {
    path: 'podcast',
    data: { title: 'Podcast' },
    component: PodcastsComponent,
  },
  {
    path: 'stream',
    data: { title: 'Stream' },
    component: StreamComponent,
  },

  //Route Nex Community
  {
    path: 'category-talk',
    data: { title: 'Categories' },
    component: CategoryTalkComponent,
  },
  //Nex Community
  {
    path: 'community',
    data: { title: 'GMF Communities' },
    component: CommunityComponent,
  },
  {
    path: 'community-create',
    data: { title: 'GMF Communities' },
    component: CommunityCreateComponent,
  },
  {
    path: 'community/:uuid',
    data: { title: 'GMF Communities' },
    component: CommunityDetailComponent,
  },
  {
    path: 'community-role',
    data: { title: 'GMF Role of Communities' },
    component: CommunityRoleComponent,
  },
  //Route Nex Community

  //Route Nex Learning
  {
    path: 'article',
    data: { title: 'Article' },
    component: ArticleComponent,
  },
  {
    path: 'article-edit/:uuid',
    data: { title: 'Article Edit' },
    component: ArticleEditComponent,
  },
  {
    path: 'article-category',
    data: { title: 'Category' },
    component: ArticleCategoryComponent,
  },
  {
    path: 'inspirational-story',
    data: { title: 'Inspirational Story' },
    component: InspirationStoryComponent,
  },
  {
    path: 'retirement-story',
    data: { title: 'Retirement Story' },
    component: RetirementStoryComponent,
  },
  {
    path: 'story-publish',
    data: { title: 'Inspirational Story' },
    component: StoryPublishComponent,
  },
  {
    path: 'story-edit/:uuid',
    data: { title: 'Inspirational Story' },
    component: StoryEditComponent,
  },
  {
    path: 'best-practice',
    data: { title: 'Best Practice' },
    component: BestPracticeComponent,
  },
  {
    path: 'best-practice-edit/:uuid',
    data: { title: 'Best Practice' },
    component: BestPracticeEditComponent,
  },
  {
    path: 'best-practice-publish',
    data: { title: 'Best Practice' },
    component: BestPracticePublishComponent,
  },
  //Route Nex Learning
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
