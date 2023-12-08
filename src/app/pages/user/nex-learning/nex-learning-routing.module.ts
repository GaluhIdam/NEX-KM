import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NexLearningComponent } from './nex-learning.component';
import { ArticleComponent } from './sub-pages/article/article.component';
import { InspirationalStoryComponent } from './sub-pages/inspirational-story/inspirational-story.component';
import { RetirementStoryComponent } from './sub-pages/retirement-story/retirement-story.component';
import { BestPracticeComponent } from './sub-pages/best-practice/best-practice.component';
import { ArticleViewComponent } from './sub-pages/article-view/article-view.component';
import { ArticleManagementComponent } from './sub-pages/article-management/article-management.component';
import { ArticleCategoryComponent } from './sub-pages/article-category/article-category.component';
import { ArticlePublishComponent } from './sub-pages/article-publish/article-publish.component';
import { ArticleEditComponent } from './sub-pages/article-edit/article-edit.component';
import { StoryViewComponent } from './sub-pages/story-view/story-view.component';
import { BestPracticeViewComponent } from './sub-pages/best-practice-view/best-practice-view.component';

const routes: Routes = [
  { path: '', component: NexLearningComponent },

  //Article
  {
    path: 'article',
    component: ArticleComponent,
  },
  {
    path: 'article-publish',
    component: ArticlePublishComponent,
  },
  {
    path: 'article-edit/:uuid',
    component: ArticleEditComponent,
  },
  {
    path: 'article-management',
    component: ArticleManagementComponent,
  },
  {
    path: 'article-category',
    component: ArticleCategoryComponent,
  },
  {
    path: 'article-category/:id',
    component: ArticleCategoryComponent,
  },
  {
    path: 'article/:uuid',
    component: ArticleViewComponent,
  },

  //Story
  {
    path: 'inspirational-story',
    component: InspirationalStoryComponent,
  },
  {
    path: 'retirement-story',
    component: RetirementStoryComponent,
  },
  {
    path: 'story-view/:uuid',
    component: StoryViewComponent,
  },

  //Best Pratice
  {
    path: 'best-practice',
    component: BestPracticeComponent,
  },
  {
    path: 'best-practice/:uuid',
    component: BestPracticeViewComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NexLearningRoutingModule { }
