import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { NexLearningServiceInterface } from './interfaces/nex-learning.serivce.interface';
import { UserDTO } from './dtos/user.dto';
import {
  ArticlePublishDTO,
  ArticleStatusDTO,
  ArticlesDTO,
  StatisticArticleDTO,
} from './dtos/articles.dto';
import {
  StoryDTO,
  StoryPublishDTO,
  StoryStatusDTO,
  WatchStoryDTO,
} from './dtos/story.dto';
import {
  ArticleCategoryDTO,
  CreateArticleCategoryDTO,
} from './dtos/article-category.dto';
import {
  ArticleCommentDTO,
  ArticleCommentPostDTO,
} from './dtos/article-comment.dto';
import {
  ArticleCommentLikeDTO,
  ArticleCommentLikePostDTO,
} from './dtos/article-comment-like.dto';
import {
  ResponseArrayDTO,
  ResponseObjectDTO,
} from 'src/app/core/dtos/response.dto';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { environment } from 'src/environments/environment.prod';
import {
  BestPracticeDTO,
  BestPracticePublishDTO,
  BestPracticeStatusDTO,
  CommentBestPracticeCreateDTO,
  CommentBestPracticeDTO,
  CommentLikeBestPracticeCreateDTO,
  CommentLikeBestPracticeDTO,
} from './dtos/best-practice.dto';
import {
  LearningFuseDTO,
  MergeLearningDTO,
  ResultMergeLearningDTO,
} from './dtos/fuse.dto';

@Injectable({
  providedIn: 'root',
})
export class NexLearningService
  extends BaseController
  implements NexLearningServiceInterface
{
  constructor(private http: HttpClient) {
    super(NexLearningService.name);
  }

  private headers = new HttpHeaders().set('x-api-key', '343C-ED0B-4137-B27E');

  //File Getter
  getImageFromUrl(url: string): Observable<File> {
    return this.http.get(url, { responseType: 'blob' }).pipe(
      map((response) => {
        const contentType = 'image/jpeg';
        const blob = new Blob([response], { type: 'image/jpeg' });
        const fileName = url.substring(url.lastIndexOf('/') + 1);
        const file = new File([blob], fileName, { type: contentType });
        return file;
      }),
      catchError(this.handleError)
    );
  }

  getVideoFromUrl(url: string): Observable<File> {
    return this.http.get(url, { responseType: 'blob' }).pipe(
      map((response) => {
        const contentType = 'video/mp4';
        const blob = new Blob([response], { type: 'video/mp4' });
        const fileName = url.substring(url.lastIndexOf('/') + 1);
        const file = new File([blob], fileName, { type: contentType });
        return file;
      }),
      catchError(this.handleError)
    );
  }

  //Get User
  getUser(personalNumber: number | string): Observable<UserDTO> {
    return this.http
      .get<UserDTO>(environment.soeUrl + personalNumber, {
        headers: this.headers,
      })
      .pipe(
        map((response: any) => {
          return response.body;
        }),
        catchError(this.handleError)
      );
  }

  // COMMENT METHOD --->

  // Get Comment on Article
  getCommentData(
    page: number,
    limit: number,
    articleId: number,
    sortBy: string
  ): Observable<ResponseArrayDTO<ArticleCommentDTO[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('id_article', articleId)
      .set('sortBy', sortBy);
    return this.http
      .get<ResponseArrayDTO<ArticleCommentDTO[]>>(
        environment.httpUrl + '/v1/api/' + 'article-comment',
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  getChildCommentData(
    page: number,
    limit: number,
    articleId: number,
    sortBy: string,
    parentId: number
  ): Observable<ResponseArrayDTO<ArticleCommentDTO[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('id_article', articleId)
      .set('sortBy', sortBy)
      .set('parentId', parentId);
    return this.http
      .get<ResponseArrayDTO<ArticleCommentDTO[]>>(
        environment.httpUrl + '/v1/api/' + 'article-comment/child-comments',
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  // COMMENT METHOD --->

  // ARTICLE METHOD --->
  getArticleDataByPersonalNumber(
    page: number,
    limit: number,
    personalNumber: string,
    search: string,
    sortBy: string
  ): Observable<ResponseArrayDTO<ArticlesDTO<ArticleCategoryDTO>[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('personalNumber', personalNumber)
      .set('search', search)
      .set('sortBy', sortBy);
    return this.http
      .get<ResponseArrayDTO<ArticlesDTO<ArticleCategoryDTO>[]>>(
        environment.httpUrl + '/v1/api/' + 'article/my-article',
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  getArticleData(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): Observable<ResponseArrayDTO<ArticlesDTO<ArticleCategoryDTO>[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('search', search)
      .set('sortBy', sortBy);

    return this.http
      .get<ResponseArrayDTO<ArticlesDTO<ArticleCategoryDTO>[]>>(
        environment.httpUrl + '/v1/api/' + 'article',
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  getArticleDataCategory(
    page: number,
    limit: number,
    search: string,
    sortBy: string,
    articleCategoryId?: number,
    isAdmin?: string
  ): Observable<ResponseArrayDTO<ArticlesDTO<ArticleCategoryDTO>[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('search', search)
      .set('sortBy', sortBy)
      .set('articleCategoryId', articleCategoryId!)
      .set('isAdmin', isAdmin!);

    return this.http
      .get<ResponseArrayDTO<ArticlesDTO<ArticleCategoryDTO>[]>>(
        environment.httpUrl + '/v1/api/' + 'article',
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  getArticleDataId(
    uuid: string
  ): Observable<ResponseObjectDTO<ArticlesDTO<ArticleCategoryDTO>>> {
    return this.http
      .get<ResponseObjectDTO<ArticlesDTO<ArticleCategoryDTO>>>(
        environment.httpUrl + '/v1/api/' + 'article/' + uuid
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  createArticle(
    dto: ArticlePublishDTO
  ): Observable<ResponseObjectDTO<ArticlePublishDTO>> {
    const formData = new FormData();
    formData.append('image', dto.image!);
    formData.append('personalNumber', `${dto.personalNumber}`);
    formData.append('articleCategoryId', `${dto.articleCategoryId}`);
    formData.append('title', `${dto.title}`);
    formData.append('content', `${dto.content}`);
    formData.append('uploadBy', `${dto.uploadBy}`);
    formData.append('unit', `${dto.unit}`);
    return this.http
      .post<ResponseObjectDTO<ArticlePublishDTO>>(
        environment.httpUrl + '/v1/api/' + 'article',
        formData
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  updateArticle(
    uuid: string,
    dto: ArticlePublishDTO
  ): Observable<ResponseObjectDTO<ArticlePublishDTO>> {
    const formData = new FormData();
    formData.append('image', dto.image);
    formData.append('personalNumber', `${dto.personalNumber}`);
    formData.append('articleCategoryId', `${dto.articleCategoryId}`);
    formData.append('title', `${dto.title}`);
    formData.append('content', `${dto.content}`);
    formData.append('unit', `${dto.unit}`);
    formData.append('uploadBy', `${dto.uploadBy}`);
    return this.http
      .put<ResponseObjectDTO<ArticlePublishDTO>>(
        environment.httpUrl + '/v1/api/' + 'article/' + uuid,
        formData
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Status Publish or Private
  activeDeadactiveArticle(
    uuid: string,
    dto: boolean
  ): Observable<ResponseObjectDTO<ArticlesDTO<null>>> {
    const body = {
      status: dto,
    };
    return this.http
      .put<ResponseObjectDTO<ArticlesDTO<null>>>(
        environment.httpUrl + '/v1/api/' + 'article/active-deadactive/' + uuid,
        body
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Status Approval or Reject
  approvalRejectionArticle(
    uuid: string,
    dto: ArticleStatusDTO
  ): Observable<ResponseObjectDTO<ArticlesDTO<null>>> {
    const body: ArticleStatusDTO = {
      status: dto.status,
      descStatus: dto.descStatus,
      approvalBy: dto.approvalBy,
      approvalByPersonalNumber: dto.approvalByPersonalNumber,
    };
    return this.http
      .put<ResponseObjectDTO<ArticlesDTO<null>>>(
        environment.httpUrl + '/v1/api/' + 'article/approve-reject/' + uuid,
        body
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Editor Choice
  editorChoiceArticle(
    uuid: string,
    status: boolean
  ): Observable<ResponseObjectDTO<ArticlesDTO<null>>> {
    const body = {
      status: status,
    };
    return this.http
      .put<ResponseObjectDTO<ArticlesDTO<null>>>(
        environment.httpUrl + '/v1/api/' + 'article/editor-choice/' + uuid,
        body
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Get Category Article
  getCategoryArticle(
    page?: number | null,
    limit?: number | null,
    search?: string | null,
    optionx?: string
  ): Observable<ResponseArrayDTO<ArticleCategoryDTO[]>> {
    if (optionx === 'false') {
      const params = new HttpParams()
        .set('page', page!)
        .set('limit', limit!)
        .set('search', search!)
        .set('optionx', optionx!);
      return this.http
        .get<ResponseArrayDTO<ArticleCategoryDTO[]>>(
          environment.httpUrl + '/v1/api/' + 'article-category',
          { params: params }
        )
        .pipe(
          map((response) => {
            return response;
          }),
          catchError(this.handleError)
        );
    } else {
      const params = new HttpParams().set('optionx', optionx!);
      return this.http
        .get<ResponseArrayDTO<ArticleCategoryDTO[]>>(
          environment.httpUrl + '/v1/api/' + 'article-category',
          { params: params }
        )
        .pipe(
          map((response) => {
            return response;
          }),
          catchError(this.handleError)
        );
    }
  }

  //Create category article
  createCategoryArticle(
    dto: CreateArticleCategoryDTO
  ): Observable<ArticleCategoryDTO> {
    return this.http
      .post<ArticleCategoryDTO>(
        environment.httpUrl + '/v1/api/' + 'article-category',
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Update category article
  updateCetagoryArticle(
    uuid: string,
    dto: CreateArticleCategoryDTO
  ): Observable<ArticleCategoryDTO> {
    return this.http
      .put<ArticleCategoryDTO>(
        environment.httpUrl + '/v1/api/' + 'article-category/' + uuid,
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Active or Deactive category article
  activeDeactiveCategoryArticle(
    uuid: string,
    dto: ArticleCategoryDTO
  ): Observable<ArticleCategoryDTO> {
    return this.http
      .put<ArticleCategoryDTO>(
        environment.httpUrl +
          '/v1/api/' +
          'article-category/active-deactive/' +
          uuid,
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  // ARTICLE METHOD --->

  // STORY METHOD -->

  //Get Story
  getStory(
    page: number,
    limit: number,
    search: string,
    category: string,
    sortBy: string,
    isAdmin?: string
  ): Observable<ResponseArrayDTO<StoryDTO[]>> {
    if (isAdmin) {
      const params = new HttpParams()
        .set('page', page)
        .set('limit', limit)
        .set('search', search)
        .set('category', category)
        .set('sortBy', sortBy)
        .set('isAdmin', isAdmin);
      return this.http
        .get<ResponseArrayDTO<StoryDTO[]>>(
          environment.httpUrl + '/v1/api/' + 'story',
          { params: params }
        )
        .pipe(
          map((response) => {
            return response;
          }),
          catchError(this.handleError)
        );
    } else {
      const params = new HttpParams()
        .set('page', page)
        .set('limit', limit)
        .set('search', search)
        .set('category', category)
        .set('sortBy', sortBy);
      return this.http
        .get<ResponseArrayDTO<StoryDTO[]>>(
          environment.httpUrl + '/v1/api/' + 'story',
          { params: params }
        )
        .pipe(
          map((response) => {
            return response;
          }),
          catchError(this.handleError)
        );
    }
  }

  //Get Story By Id
  getStoryById(uuid: string): Observable<ResponseObjectDTO<StoryDTO>> {
    return this.http
      .get<ResponseObjectDTO<StoryDTO>>(
        environment.httpUrl + '/v1/api/' + 'story/' + uuid
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Create Story
  createStory(dto: StoryPublishDTO): Observable<StoryPublishDTO> {
    const formData = new FormData();
    formData.append('video', dto.fileVideo!);
    formData.append('cover', dto.cover);
    formData.append('category', dto.category);
    formData.append('title', dto.title);
    formData.append('description', dto.description);
    formData.append('personalNumber', dto.personalNumber);
    formData.append('unit', dto.unit);
    formData.append('uploadBy', dto.uploadBy);
    formData.append('status', String(dto.status));
    return this.http
      .post<StoryPublishDTO>(
        environment.httpUrl + '/v1/api/' + 'story',
        formData,
        { reportProgress: true, observe: 'events' }
      )
      .pipe(
        map((response: any) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Update Story
  updateStory(uuid: string, dto: StoryPublishDTO): Observable<StoryPublishDTO> {
    const formData = new FormData();
    formData.append('video', dto.fileVideo!);
    formData.append('cover', dto.cover);
    formData.append('category', dto.category);
    formData.append('title', dto.title);
    formData.append('description', dto.description);
    formData.append('personalNumber', dto.personalNumber);
    formData.append('unit', dto.unit);
    formData.append('uploadBy', dto.uploadBy);
    formData.append('status', String(dto.status));
    return this.http
      .put<StoryPublishDTO>(
        environment.httpUrl + '/v1/api/' + 'story/' + uuid,
        formData,
        { reportProgress: true, observe: 'events' }
      )
      .pipe(
        map((response: any) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Approve or Reject Story
  approveRejectStory(
    uuid: string,
    dto: StoryStatusDTO
  ): Observable<StoryStatusDTO> {
    return this.http
      .put<StoryStatusDTO>(
        environment.httpUrl + '/v1/api/' + 'story/approve-reject/' + uuid,
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Editor Choice
  editorChoiceStory(uuid: string, status: boolean): Observable<StoryDTO> {
    return this.http
      .put<StoryDTO>(
        environment.httpUrl + '/v1/api/' + 'story/editor-choice/' + uuid,
        { status }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Active or Deacative
  activeDeactiveStory(uuid: string, status: boolean): Observable<StoryDTO> {
    return this.http
      .put<StoryDTO>(
        environment.httpUrl + '/v1/api/' + 'story/active-deactive/' + uuid,
        { status }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Add View
  watchStory(
    uuid: string,
    personalNumber: string,
    storyId: number,
    dto: WatchStoryDTO
  ): Observable<ResponseObjectDTO<StoryDTO>> {
    const params = new HttpParams()
      .set('uuid', uuid)
      .set('personalNumber', personalNumber)
      .set('storyId', storyId);
    return this.http
      .post<ResponseObjectDTO<StoryDTO>>(
        environment.httpUrl + '/v1/api/' + 'story/watch-story',
        dto,
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  // STORY METHOD -->

  //Get Total Comment
  getTotalComment(id_article: number): Observable<void> {
    const params = new HttpParams().set('id_article', id_article);
    return this.http
      .get(environment.httpUrl + '/v1/api/' + 'article-comment/total-comment', {
        params: params,
      })
      .pipe(
        map((response: any) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Create Comment
  createComment(dto: ArticleCommentPostDTO): Observable<ArticleCommentPostDTO> {
    return this.http
      .post<ArticleCommentPostDTO>(
        environment.httpUrl + '/v1/api/' + 'article-comment',
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Update Comment
  updateComment(
    uuid: string,
    dto: ArticleCommentPostDTO
  ): Observable<ArticleCommentPostDTO> {
    return this.http
      .put<ArticleCommentPostDTO>(
        environment.httpUrl + '/v1/api/' + 'article-comment/' + uuid,
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  likeDislikeComment(
    articleId: number,
    commentArticleId: number,
    personalNumber: string,
    dto: ArticleCommentLikePostDTO
  ): Observable<ArticleCommentLikeDTO> {
    const params = new HttpParams()
      .set('articleId', articleId)
      .set('commentArticleId', commentArticleId)
      .set('personalNumber', personalNumber);
    return this.http
      .post<ArticleCommentLikeDTO>(
        environment.httpUrl + '/v1/api/' + 'article-comment-like',
        dto,
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  //Delete Comment
  deleteComment(uuid: string): Observable<ArticleCommentPostDTO> {
    return this.http
      .delete<ArticleCommentPostDTO>(
        environment.httpUrl + '/v1/api/' + 'article-comment/' + uuid
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Get Total Child Comment
  getTotalChildComment(id_article: number, parentId: number): Observable<void> {
    const params = new HttpParams()
      .set('id_article', id_article)
      .set('parentId', parentId);
    return this.http
      .get(
        environment.httpUrl +
          '/v1/api/' +
          'article-comment/total-child-comment',
        { params: params }
      )
      .pipe(
        map((response: any) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Get Child Comment
  getChildComment(
    id_article: number,
    parentId: number,
    page: number,
    limit: number,
    sortBy: string
  ): Observable<ResponseArrayDTO<ArticleCommentDTO[]>> {
    const params = new HttpParams()
      .set('id_article', id_article)
      .set('parentId', parentId)
      .set('page', page)
      .set('limit', limit)
      .set('sortBy', sortBy);
    return this.http
      .get<ResponseArrayDTO<ArticleCommentDTO[]>>(
        environment.httpUrl + '/v1/api/' + 'article-comment/child-comments',
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Get Like Or Dislike
  getLikeorDislike(
    personalNumber: string,
    articleId: number,
    commentArticleId: number
  ): Observable<ArticleCommentLikeDTO> {
    const params = new HttpParams()
      .set('personalNumber', personalNumber)
      .set('articleId', articleId)
      .set('commentArticleId', commentArticleId);
    return this.http
      .get<ArticleCommentLikeDTO>(
        environment.httpUrl + '/v1/api/' + 'article-comment-like',
        { params: params }
      )
      .pipe(
        map((response: any) => {
          return response.data;
        }),
        catchError(this.handleError)
      );
  }

  //Like or DisLike
  likeorDislike(dto: ArticleCommentLikeDTO): Observable<ArticleCommentLikeDTO> {
    return this.http
      .post<ArticleCommentLikeDTO>(
        environment.httpUrl + '/v1/api/' + 'article-comment-like',
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //BEST PRACTICE METHOD

  //Get Best Practice By UUID
  getBestPracticeByUuid(
    uuid: string
  ): Observable<ResponseObjectDTO<BestPracticeDTO>> {
    return this.http
      .get<ResponseObjectDTO<BestPracticeDTO>>(
        environment.httpUrl + '/v1/api/' + 'best-practice/' + uuid
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Get Data Best Practice
  getBestPractice(
    page: number,
    limit: number,
    search?: string,
    sortBy?: string
  ): Observable<ResponseArrayDTO<BestPracticeDTO[]>> {
    const params = new HttpParams()
      .set('page', page)
      .set('limit', limit)
      .set('search', search!)
      .set('sortBy', sortBy!);
    return this.http
      .get<ResponseArrayDTO<BestPracticeDTO[]>>(
        environment.httpUrl + '/v1/api/' + 'best-practice',
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Create Best Practice
  createBestPractice(dto: BestPracticePublishDTO): Observable<BestPracticeDTO> {
    const formData = new FormData();
    formData.append('image', dto.image);
    formData.append('personalNumber', dto.personalNumber);
    formData.append('title', dto.title);
    formData.append('content', dto.content);
    formData.append('uploadBy', dto.uploadBy);
    formData.append('unit', dto.unit);
    return this.http
      .post<BestPracticeDTO>(
        environment.httpUrl + '/v1/api/' + 'best-practice',
        formData
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Update Best Practice
  updateBestPractice(
    uuid: string,
    dto: BestPracticePublishDTO
  ): Observable<BestPracticeDTO> {
    const formData = new FormData();
    formData.append('image', dto.image);
    formData.append('personalNumber', dto.personalNumber);
    formData.append('title', dto.title);
    formData.append('content', dto.content);
    formData.append('uploadBy', dto.uploadBy);
    formData.append('unit', dto.unit);
    return this.http
      .put<BestPracticeDTO>(
        environment.httpUrl + '/v1/api/' + 'best-practice/' + uuid,
        formData
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Delete Best Practice
  deleteBestPractice(uuid: string): Observable<BestPracticeDTO> {
    return this.http
      .delete<BestPracticeDTO>(
        environment.httpUrl + '/v1/api/' + 'best-practice/' + uuid
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Approve or Reject Best Practice
  approveRejectBestPractice(
    uuid: string,
    dto: BestPracticeStatusDTO
  ): Observable<BestPracticeDTO> {
    return this.http
      .put<BestPracticeDTO>(
        environment.httpUrl +
          '/v1/api/' +
          'best-practice/approve-reject/' +
          uuid,
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Editor Choice Best Practice
  editorChoiceBestPractice(
    uuid: string,
    status: boolean
  ): Observable<BestPracticeDTO> {
    const body = {
      status: status,
    };
    return this.http
      .put<BestPracticeDTO>(
        environment.httpUrl +
          '/v1/api/' +
          'best-practice/editor-choice/' +
          uuid,
        body
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Active or Deactive Best Practice
  activeDeactiveBestPractice(
    uuid: string,
    status: boolean
  ): Observable<BestPracticeDTO> {
    const body = {
      status: status,
    };
    return this.http
      .put<BestPracticeDTO>(
        environment.httpUrl +
          '/v1/api/' +
          'best-practice/active-deactive/' +
          uuid,
        body
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Get Comment
  getBestComments(
    practiceId: number,
    page: number,
    limit: number,
    sortBy: string
  ): Observable<ResponseArrayDTO<CommentBestPracticeDTO[]>> {
    const params = new HttpParams()
      .set('practiceId', practiceId)
      .set('page', page)
      .set('limit', limit)
      .set('sortBy', sortBy);
    return this.http
      .get<ResponseArrayDTO<CommentBestPracticeDTO[]>>(
        environment.httpUrl + '/v1/api/' + 'best-practice/comment',
        {
          params: params,
        }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //Get Reply Comment
  getBestReplyComment(
    id: number,
    page: number,
    limit: number,
    sortBy: string
  ): Observable<ResponseArrayDTO<CommentBestPracticeDTO[]>> {
    const params = new HttpParams()
      .set('parentId', id)
      .set('page', page)
      .set('limit', limit)
      .set('sortBy', sortBy);
    return this.http
      .get<ResponseArrayDTO<CommentBestPracticeDTO[]>>(
        environment.httpUrl + '/v1/api/' + 'best-practice/reply-comment',
        {
          params: params,
        }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  createBestComments(
    dto: CommentBestPracticeCreateDTO
  ): Observable<CommentBestPracticeDTO> {
    return this.http
      .post<CommentBestPracticeDTO>(
        environment.httpUrl + '/v1/api/' + 'best-practice/comment',
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  updateBestComments(
    uuid: string,
    dto: CommentBestPracticeCreateDTO
  ): Observable<CommentBestPracticeDTO> {
    return this.http
      .put<CommentBestPracticeDTO>(
        environment.httpUrl + '/v1/api/' + 'best-practice/comment/' + uuid,
        dto
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  deleteBestComment(uuid: string): Observable<CommentBestPracticeDTO> {
    return this.http
      .delete<CommentBestPracticeDTO>(
        environment.httpUrl + '/v1/api/' + 'best-practice/comment/' + uuid
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  likeDislikeCommentBest(
    bestPracticeId: number,
    commentBestPracticeId: number,
    personalNumber: string,
    dto: CommentLikeBestPracticeCreateDTO
  ): Observable<CommentLikeBestPracticeDTO> {
    const params = new HttpParams()
      .set('bestPracticeId', bestPracticeId)
      .set('commentBestPracticeId', commentBestPracticeId)
      .set('personalNumber', personalNumber);
    return this.http
      .post<CommentLikeBestPracticeDTO>(
        environment.httpUrl + '/v1/api/' + 'best-practice/like',
        dto,
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        }),
        catchError(this.handleError)
      );
  }

  //BEST PRACTICE METHOD

  //Statistic
  getArticleStatistic(): Observable<ResponseObjectDTO<StatisticArticleDTO>> {
    return this.http
      .get<ResponseObjectDTO<StatisticArticleDTO>>(
        environment.httpUrl + '/v1/api/' + 'article/statistic'
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  getBestPracticeStatistic(): Observable<
    ResponseObjectDTO<StatisticArticleDTO>
  > {
    return this.http
      .get<ResponseObjectDTO<StatisticArticleDTO>>(
        environment.httpUrl + '/v1/api/' + 'best-practice/statistic'
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  getStoryStatistic(
    category: string
  ): Observable<ResponseObjectDTO<StatisticArticleDTO>> {
    return this.http
      .get<ResponseObjectDTO<StatisticArticleDTO>>(
        environment.httpUrl + '/v1/api/' + 'story/statistic/' + category
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  //Show Trending
  showTrending(): Observable<LearningFuseDTO[]> {
    return this.http
      .get<LearningFuseDTO[]>(
        environment.httpUrl + '/v1/api/' + 'search-learning/trending'
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  //Show Suggestion
  showSuggestion(search: string): Observable<LearningFuseDTO[]> {
    const params = new HttpParams().set('search', search);
    return this.http
      .get<LearningFuseDTO[]>(
        environment.httpUrl + '/v1/api/' + 'search-learning',
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  // Show Result Search
  showResultSearch(
    search: string,
    page: number,
    limit: number
  ): Observable<ResponseArrayDTO<MergeLearningDTO[]>> {
    const params = new HttpParams()
      .set('search', search)
      .set('limit', limit)
      .set('page', page);
    return this.http
      .get<ResponseArrayDTO<MergeLearningDTO[]>>(
        environment.httpUrl + '/v1/api/' + 'search-learning/result',
        { params: params }
      )
      .pipe(
        map((response) => {
          return response;
        })
      );
  }

  showResultSearchByInterest(search: string[]): Observable<MergeLearningDTO[]> {
    let params = new HttpParams();
    search.forEach((term) => {
      params = params.append('search', term);
    });

    return this.http.get<MergeLearningDTO[]>(
      environment.httpUrl + '/v1/api/search-learning/result-interest',
      { params: params }
    );
  }
}
