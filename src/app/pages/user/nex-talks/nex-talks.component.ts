import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router } from '@angular/router';
import {
  faSearch,
  faMessage,
  faShareNodes,
  faTag,
  faBookOpen,
  faImage,
  faMusic,
  faVolumeHigh,
  faFilm,
} from '@fortawesome/free-solid-svg-icons';
import { PlyrComponent } from 'ngx-plyr';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { ForumCommentDTO } from 'src/app/core/dtos/nex-talk/forum-comment.dto';
import { ForumDTO } from 'src/app/core/dtos/nex-talk/forum.dto';
import { PodcastDTO } from 'src/app/core/dtos/nex-talk/podcast.dto';
import { SerieDTO } from 'src/app/core/dtos/nex-talk/serie.dto';
import { StreamDTO } from 'src/app/core/dtos/nex-talk/stream.dto';
import { LocalService } from 'src/app/core/services/local/local.service';
import { ForumDataService } from 'src/app/core/services/nex-talk/forum-data.service';
import { PodcastDataService } from 'src/app/core/services/nex-talk/podcast-data.service';
import { SerieDataService } from 'src/app/core/services/nex-talk/serie-data.service';
import { StreamDataService } from 'src/app/core/services/nex-talk/stream-data.service';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import { Modal, Ripple, initTE } from 'tw-elements';
import {
  UserListDTO,
  defaultUserListDTO,
} from '../home-page/dtos/user-list.dto';
import { HomePageService } from '../home-page/homepage.service';

@Component({
  selector: 'app-nex-talks',
  templateUrl: './nex-talks.component.html',
  styleUrls: ['./nex-talks.component.css'],
})
export class NexTalksComponent implements OnInit, OnDestroy {
  bg_library = '../../../../assets/image/library/bg-library.jpg';
  faSearch = faSearch;
  faMessage = faMessage;
  faShareNodes = faShareNodes;
  faTag = faTag;
  faBookOpen = faBookOpen;
  faImage = faImage;
  faVolumeHigh = faVolumeHigh;
  faFilm = faFilm;

  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  //#region ------------ Forums ----------------------
  forumData: ForumDTO[];
  forumUploaders: UserListDTO[];
  // Parse the description HTML string
  parsedForumDescriptions: string[];
  isForumLoading: boolean;
  isShowMoreButtonClicked: boolean[];
  //#endregion --------- Forums ----------------------

  //#region ------------- Podcasts -------------------
  podcastSerieData: SerieDTO[];
  isPodcastSerieLoading: boolean;
  //#endregion ---------- Podcasts -------------------

  //#region ------------- Streams --------------------
  streamData: StreamDTO[];
  streamUploaders: UserListDTO[];
  photoStreamUploaders: string[];
  isStreamLoading: boolean;
  //#endregion ---------- Streams --------------------

  constructor(
    private readonly router: Router,
    private readonly sanitizer: DomSanitizer,
    private readonly forumDataService: ForumDataService,
    private readonly serieDataService: SerieDataService,
    private readonly streamDataService: StreamDataService,
    private readonly localService: LocalService,
    private readonly homePageService: HomePageService
  ) {
    this.forumData = [];
    this.isForumLoading = false;
    this.parsedForumDescriptions = [];
    this.forumUploaders = [];
    this.podcastSerieData = [];
    this.isPodcastSerieLoading = false;
    this.streamData = [];
    this.isStreamLoading = false;
    this.streamUploaders = [];
    this.photoStreamUploaders = [];
    this.isShowMoreButtonClicked = [];
  }

  ngOnInit(): void {
    initTE({ Modal, Ripple });
    this.initForumData();
    this.initPodcastSerieData();
    this.initStreamData();
  }

  ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();
  }

  //Media Player
  @ViewChild(PlyrComponent, { static: true })
  plyr!: PlyrComponent;

  player!: Plyr;

  played(event: Plyr.PlyrEvent) {
    console.log('played', event);
  }

  play(): void {
    this.player.play();
  }

  pause(): void {
    this.player.pause();
  }

  stop(): void {
    this.player.stop();
  }

  forumPage(): void {
    this.router.navigate(['/user/nex-talks/forum']);
  }

  postForumPage(): void {
    this.router.navigate(['/user/nex-talks/forum/post']);
  }

  podcastPage(): void {
    this.router.navigate(['/user/nex-talks/podcast']);
  }

  myPodcastPage(): void {
    this.router.navigate(['/user/nex-talks/podcast/my-podcast']);
  }

  publishStreamPage(): void {
    this.router.navigate(['/user/nex-talks/stream/publish']);
  }

  onGotoUserPage(personalNumber: string): void {
    this.router.navigate([`/user/home-page/view-user/${personalNumber}`]);
  }

  forumComment(forum: ForumDTO): void {
    this.localService.saveData(
      'selected_forum_category',
      JSON.stringify(forum.talkCategory)
    );
    this.router.navigate(['/user/nex-talks/forum/comments/' + forum.uuid]);
  }

  streamPage(): void {
    this.router.navigate(['/user/nex-talks/stream']);
  }

  streamStreaming(uuid: string): void {
    this.router.navigate(['/user/nex-talks/stream/streaming/' + uuid]);
  }

  initForumData(): void {
    this.isForumLoading = true;
    let params: string = `page=${1}&limit=${3}&status=${true}&approval_status=Approved`;

    this.forumDataService
      .getForumData(params)
      .pipe(
        tap((response) => {
          this.forumUploaders = new Array(response.data.data.length).fill(
            defaultUserListDTO
          );
          this.parsedForumDescriptions = new Array(response.data.data.length);
          this.isShowMoreButtonClicked = new Array(response.data.data.length);
          response.data.data.map((dt, index) => {
            this.getUserData(dt.personalNumber, index, 'forum');
            if (dt.path !== '-') {
              dt.path =
                environment.httpUrl +
                '/v1/api/file-manager/get-imagepdf/' +
                dt.path;
            }
            this.parsedForumDescriptions[index] = this.parseHTML(
              dt.description
            );
            this.isShowMoreButtonClicked[index] = false;
          });
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe((response) => {
        this.forumData = response.data.data;
        this.isForumLoading = false;
      });
  }

  initPodcastSerieData(): void {
    this.isPodcastSerieLoading = true;
    let params: string = `page=${1}&limit=${6}&status=${true}&approval_status=Approved`;

    this.serieDataService
      .getSerieData(params)
      .pipe(
        tap((response) => {
          response.data.data.map((element) => {
            element.path =
              environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' +
              element.path;
          });
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe((response) => {
        this.podcastSerieData = response.data.data;
        this.isPodcastSerieLoading = false;
      });
  }

  initStreamData(): void {
    this.isStreamLoading = true;
    let params: string = `page=${1}&limit=${4}&status=${true}&approval_status=Approved`;

    this.streamDataService
      .getStreamData(params)
      .pipe(
        tap((response) => {
          this.photoStreamUploaders = new Array(response.data.data.length);
          response.data.data.map((element, index) => {
            this.checkphoto(
              element.personalNumber,
              index,
              'stream'
            ).subscribe();
            element.pathVideo =
              environment.httpUrl +
              '/v1/api/file-manager/get-m3u8/' +
              element.pathVideo.replace('/transcodeMP4.m3u8', '');
            element.pathThumbnail =
              environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' +
              element.pathThumbnail;
          });
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe((response) => {
        this.streamData = response.data.data;
        this.isStreamLoading = false;
      });
  }

  //Check Photo
  private checkphoto(
    personal_number: string,
    index: number,
    type: string
  ): Observable<void> {
    const imageUrl = `https://talentlead.gmf-aeroasia.co.id/images/avatar/${personal_number}.jpg`;

    return new Observable<void>((observer) => {
      const img = new Image();
      img.onload = () => {
        if (type === 'forum') {
          // this.photoForumUploaders[index] = imageUrl;
        } else if (type === 'stream') {
          this.photoStreamUploaders[index] = imageUrl;
        }
        observer.next();
        observer.complete();
      };
      img.onerror = () => {
        const defaultImageUrl =
          'https://st3.depositphotos.com/1767687/16607/v/450/depositphotos_166074422-stock-illustration-default-avatar-profile-icon-grey.jpg';

        if (type === 'forum') {
          // this.photoForumUploaders[index] = defaultImageUrl;
        } else if (type === 'stream') {
          this.photoStreamUploaders[index] = defaultImageUrl;
        }
        observer.next();
        observer.complete();
      };
      img.src = imageUrl;
    });
  }

  //Get User Data
  private getUserData(
    personal_number: string,
    index: number,
    type: string
  ): void {
    this.homePageService
      .getUserListByPersonalNumber(personal_number)
      .pipe(
        tap((response) => {
          response.data.userPhoto =
            environment.httpUrl +
            '/v1/api/file-manager/get-imagepdf/' +
            response.data.userPhoto;
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe((response) => {
        if (type === 'forum') {
          this.forumUploaders[index] = response.data;
        } else if (type === 'stream') {
          this.streamUploaders[index] = response.data;
        }
      });
  }

  calculateTimeDifference(createdAt: string): string {
    const createdAtDate = new Date(createdAt);
    const currentDate = new Date();
    const timeDifference = currentDate.getTime() - createdAtDate.getTime();

    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days >= 1) {
      return `${days}d ago`;
    } else if (hours >= 1) {
      return `${hours}hr ago`;
    } else if (minutes >= 1) {
      return `${minutes}min ago`;
    } else {
      return `${seconds}sec ago`;
    }
  }

  convertViewsFormat(viewCount: number): string {
    if (viewCount >= 1000000) {
      const formattedViews = (viewCount / 1000000).toFixed(1);
      return formattedViews + 'M';
    } else {
      return viewCount.toString();
    }
  }

  //Decode HTML
  getSanitizedHTML(htmlString: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(htmlString);
  }

  parseHTML(htmlString: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    return doc.body.innerHTML;
  }

  filteredForumComments(comment: ForumCommentDTO[]): number {
    return comment.filter((comment) => comment.parentId === null).length;
  }

  onClickedShowMoreButton(forumIndex: number) {
    this.isShowMoreButtonClicked[forumIndex] =
      !this.isShowMoreButtonClicked[forumIndex];
  }
}
