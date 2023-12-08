import { Observable } from 'rxjs';
import { UserDTO } from '../dtos/user.dto';
import {
  ArticlePublishDTO,
  ArticleStatusDTO,
  ArticlesDTO,
} from '../dtos/articles.dto';
import {
  StoryDTO,
  StoryPublishDTO,
  StoryStatusDTO,
  WatchStoryDTO,
} from '../dtos/story.dto';
import {
  ArticleCategoryDTO,
  CreateArticleCategoryDTO,
} from '../dtos/article-category.dto';
import {
  ArticleCommentDTO,
  ArticleCommentPostDTO,
} from '../dtos/article-comment.dto';
import { ArticleCommentLikeDTO } from '../dtos/article-comment-like.dto';
import {
  ResponseArrayDTO,
  ResponseObjectDTO,
} from 'src/app/core/dtos/response.dto';
import {
  BestPracticeDTO,
  BestPracticePublishDTO,
  BestPracticeStatusDTO,
  CommentBestPracticeCreateDTO,
  CommentBestPracticeDTO,
  CommentLikeBestPracticeCreateDTO,
  CommentLikeBestPracticeDTO,
} from '../dtos/best-practice.dto';

export abstract class NexLearningServiceInterface {
  abstract getUser(personalNumber: number): Observable<UserDTO>;

  // Article Method
  abstract getArticleDataByPersonalNumber(
    page: number,
    limit: number,
    personalNumber: string,
    search: string,
    sortBy: string
  ): Observable<ResponseArrayDTO<ArticlesDTO<ArticleCategoryDTO>[]>>;
  abstract getArticleData(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): Observable<ResponseArrayDTO<ArticlesDTO<ArticleCategoryDTO>[]>>;
  abstract getArticleDataId(
    uuid: string
  ): Observable<ResponseObjectDTO<ArticlesDTO<ArticleCategoryDTO>>>;
  abstract createArticle(
    dto: ArticlePublishDTO
  ): Observable<ResponseObjectDTO<ArticlePublishDTO>>;
  abstract updateArticle(
    uuid: string,
    dto: ArticlePublishDTO
  ): Observable<ResponseObjectDTO<ArticlePublishDTO>>;
  abstract activeDeadactiveArticle(
    uuid: string,
    dto: boolean
  ): Observable<ResponseObjectDTO<ArticlesDTO<null>>>;
  abstract approvalRejectionArticle(
    uuid: string,
    dto: ArticleStatusDTO
  ): Observable<ResponseObjectDTO<ArticlesDTO<null>>>;
  abstract editorChoiceArticle(
    uuid: string,
    status: boolean
  ): Observable<ResponseObjectDTO<ArticlesDTO<null>>>;

  //Article Category Method
  abstract getCategoryArticle(
    page?: number,
    limit?: number,
    search?: string,
    optionx?: string
  ): Observable<ResponseArrayDTO<ArticleCategoryDTO[]>>;
  abstract createCategoryArticle(
    dto: CreateArticleCategoryDTO
  ): Observable<ArticleCategoryDTO>;
  abstract updateCetagoryArticle(
    uuid: string,
    dto: ArticleCategoryDTO
  ): Observable<ArticleCategoryDTO>;
  abstract activeDeactiveCategoryArticle(
    uuid: string,
    dto: ArticleCategoryDTO
  ): Observable<ArticleCategoryDTO>;
  //Article Category Method



  //Comment Method
  abstract getCommentData(
    page: number,
    limit: number,
    articleId: number,
    sortBy: string
  ): Observable<ResponseArrayDTO<ArticleCommentDTO[]>>;

  //Story Method
  abstract getStory(
    page: number,
    limit: number,
    search: string,
    category: string,
    sortBy: string
  ): Observable<ResponseArrayDTO<StoryDTO[]>>;
  abstract getStoryById(uuid: string): Observable<ResponseObjectDTO<StoryDTO>>;
  abstract createStory(dto: StoryPublishDTO): Observable<StoryPublishDTO>;
  abstract approveRejectStory(
    uuid: string,
    dto: StoryStatusDTO
  ): Observable<StoryStatusDTO>;
  abstract editorChoiceStory(
    uuid: string,
    status: boolean
  ): Observable<StoryDTO>;
  abstract activeDeactiveStory(
    uuid: string,
    status: boolean
  ): Observable<StoryDTO>;
  abstract watchStory(
    uuid: string,
    personalNumber: string,
    storyId: number,
    dto: WatchStoryDTO
  ): Observable<ResponseObjectDTO<StoryDTO>>;

  //Best Practice Method
  // abstract getBestPracticeByUuid(
  //   uuid: string
  // ): Observable<ResponseObjectDTO<BestPracticeDTO>>;
  // abstract getBestPractice(
  //   page: number,
  //   limit: number,
  //   search?: string,
  //   sortBy?: string
  // ): Observable<ResponseArrayDTO<BestPracticeDTO[]>>;
  // abstract createBestPractice(
  //   dto: BestPracticePublishDTO
  // ): Observable<BestPracticeDTO>;
  // abstract updateBestPractice(
  //   uuid: string,
  //   dto: BestPracticePublishDTO
  // ): Observable<BestPracticeDTO>;
  // abstract deleteBestPractice(uuid: string): Observable<BestPracticeDTO>;
  // abstract approveRejectBestPractice(
  //   uuid: string,
  //   dto: BestPracticeStatusDTO
  // ): Observable<BestPracticeDTO>;
  // abstract editorChoiceBestPractice(
  //   uuid: string,
  //   status: boolean
  // ): Observable<BestPracticeDTO>;
  // abstract activeDeactiveBestPractice(
  //   uuid: string,
  //   status: boolean
  // ): Observable<BestPracticeDTO>;

  //Best Practice Method
  abstract getBestPracticeByUuid(uuid: string): Observable<ResponseObjectDTO<BestPracticeDTO>>;
  abstract getBestPractice(page: number, limit: number, search?: string, sortBy?: string): Observable<ResponseArrayDTO<BestPracticeDTO[]>>
  abstract createBestPractice(dto: BestPracticePublishDTO): Observable<BestPracticeDTO>;
  abstract updateBestPractice(uuid: string, dto: BestPracticePublishDTO): Observable<BestPracticeDTO>;
  abstract deleteBestPractice(uuid: string): Observable<BestPracticeDTO>;
  abstract approveRejectBestPractice(uuid: string, dto: BestPracticeStatusDTO): Observable<BestPracticeDTO>;
  abstract editorChoiceBestPractice(uuid: string, status: boolean): Observable<BestPracticeDTO>;
  abstract activeDeactiveBestPractice(uuid: string, status: boolean): Observable<BestPracticeDTO>;

  //Comment Method
  abstract getTotalComment(id_article: number): Observable<void>;
  abstract createComment(
    dto: ArticleCommentPostDTO
  ): Observable<ArticleCommentPostDTO>;
  abstract updateComment(
    uuid: string,
    dto: ArticleCommentPostDTO
  ): Observable<ArticleCommentPostDTO>;
  abstract deleteComment(uuid: string): Observable<ArticleCommentPostDTO>;

  //Child Comment Method
  abstract getTotalChildComment(
    id_article: number,
    parentId: number
  ): Observable<void>;
  abstract getChildComment(
    id_article: number,
    parentId: number,
    page: number,
    limit: number,
    sortBy: string
  ): Observable<ResponseArrayDTO<ArticleCommentDTO[]>>;

  //Like Comment Method
  abstract getLikeorDislike(
    personalNumber: string,
    articleId: number,
    commentArticleId: number
  ): Observable<ArticleCommentLikeDTO>;
  abstract likeorDislike(
    dto: ArticleCommentLikeDTO
  ): Observable<ArticleCommentLikeDTO>;

  abstract getBestComments(
    practiceId: number,
    page: number,
    limit: number,
    sortBy: string
  ): Observable<ResponseArrayDTO<CommentBestPracticeDTO[]>>;

  abstract createBestComments(
    dto: CommentBestPracticeCreateDTO
  ): Observable<CommentBestPracticeDTO>;

  abstract updateBestComments(
    uuid: string,
    dto: CommentBestPracticeCreateDTO
  ): Observable<CommentBestPracticeDTO>;

  abstract deleteBestComment(uuid: string): Observable<CommentBestPracticeDTO>;

  abstract likeDislikeCommentBest(
    bestPracticeId: number,
    commentBestPracticeId: number,
    personalNumber: string,
    dto: CommentLikeBestPracticeCreateDTO
  ): Observable<CommentLikeBestPracticeDTO>;
}
