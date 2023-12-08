import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faChevronRight, faSearch } from '@fortawesome/free-solid-svg-icons';
import { KeycloakService } from 'keycloak-angular';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { StreamDTO } from 'src/app/core/dtos/nex-talk/stream.dto';
import { StreamDataService } from 'src/app/core/services/nex-talk/stream-data.service';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import { initializeKeycloak } from '../../../../../core/utility/app.init';
import { LocalService } from 'src/app/core/services/local/local.service';

@Component({
  selector: 'app-stream-page',
  templateUrl: './stream-page.component.html',
  styleUrls: ['./stream-page.component.css'],
})
export class StreamPageComponent implements OnInit, OnDestroy {
  bg_community =
    '../../../../assets/image/community/headline/basketball-headline.jpg';
  faSearch = faSearch;
  faChevronRight = faChevronRight;

  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  //#region ------------- Streams Editor Choice --------------------
  streamEditorChoiceData: StreamDTO[];
  photoStreamEditorChoiceUploaders: string[];
  isStreamEditorChoiceLoading: boolean;
  //#endregion ---------- Streams Editor Choice --------------------

  //#region ------------- Streams Trending -------------------------
  streamTrendingData: StreamDTO[];
  photoStreamTrendingUploaders: string[];
  isStreamTrendingLoading: boolean;
  //#endregion ---------- Streams Trending -------------------------

  //#region ------------- Streams User -------------------------
  streamUserData: StreamDTO[];
  photoStreamUserUploaders: string[];
  isStreamUserLoading: boolean;
  userPersonalNumber: string;
  //#endregion ---------- Streams User -------------------------

  constructor(
    private readonly router: Router,
    private readonly localService: LocalService,
    private readonly keycloakService: KeycloakService,
    private readonly streamDataService: StreamDataService
  ) {
    this.streamEditorChoiceData = [];
    this.photoStreamEditorChoiceUploaders = [];
    this.isStreamEditorChoiceLoading = false;
    this.streamTrendingData = [];
    this.photoStreamTrendingUploaders = [];
    this.isStreamTrendingLoading = false;
    this.streamUserData = [];
    this.photoStreamUserUploaders = [];
    this.isStreamUserLoading = false;
    this.userPersonalNumber = '';
  }

  ngOnInit(): void {
    this.initializeUser();
    this.initStreamEditorChoiceData();
    this.initStreamTrendingData();
    this.initStreamUserData();
  }

  ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();
  }

  streamPageList(streamCategory: string): void {
    this.localService.saveData('stream_category', streamCategory);
    this.router.navigate(['/user/nex-talks/stream/list']);
  }

  streamStreaming(uuid: string): void {
    this.router.navigate(['/user/nex-talks/stream/streaming/' + uuid]);
  }

  initStreamEditorChoiceData(): void {
    this.isStreamEditorChoiceLoading = true;
    let params: string = `page=${1}&limit=${4}&editorChoice=${true}&status=${true}&approval_status=Approved`;

    this.streamDataService
      .getStreamData(params)
      .pipe(
        tap((response) => {
          this.photoStreamEditorChoiceUploaders = new Array(
            response.data.data.length
          );
          response.data.data.map((element, index) => {
            this.checkphoto(
              element.personalNumber,
              'editor-choice',
              index
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
        this.streamEditorChoiceData = response.data.data;

        this.isStreamEditorChoiceLoading = false;
      });
  }

  initStreamTrendingData(): void {
    this.isStreamTrendingLoading = true;
    let params: string = `page=${1}&limit=${4}&orderBy=trending&status=${true}&approval_status=Approved`;

    this.streamDataService
      .getStreamData(params)
      .pipe(
        tap((response) => {
          this.photoStreamTrendingUploaders = new Array(
            response.data.data.length
          );
          response.data.data.map((element, index) => {
            this.checkphoto(
              element.personalNumber,
              'trending',
              index
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
        this.streamTrendingData = response.data.data;

        this.isStreamTrendingLoading = false;
      });
  }

  initStreamUserData(): void {
    this.isStreamEditorChoiceLoading = true;
    let params: string = `page=${1}&limit=${4}&personalNumber=${
      this.userPersonalNumber
    }`;

    this.streamDataService
      .getStreamData(params)
      .pipe(
        tap((response) => {
          this.photoStreamEditorChoiceUploaders = new Array(
            response.data.data.length
          );
          response.data.data.map((element, index) => {
            this.checkphoto(element.personalNumber, 'user', index).subscribe();
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
        this.streamUserData = response.data.data;
        this.isStreamUserLoading = false;
      });
  }

  //GET Personal Number from Keycloak
  private initializeUser(): void {
    this.userPersonalNumber = this.keycloakService.getUsername();
  }

  //Check Photo
  private checkphoto(
    personal_number: string,
    type: string,
    index: number
  ): Observable<void> {
    const imageUrl = `https://talentlead.gmf-aeroasia.co.id/images/avatar/${personal_number}.jpg`;

    return new Observable<void>((observer) => {
      const img = new Image();
      img.onload = () => {
        if (type === 'editor-choice') {
          this.photoStreamEditorChoiceUploaders[index] = imageUrl;
        } else if (type === 'trending') {
          this.photoStreamTrendingUploaders[index] = imageUrl;
        } else if (type === 'user') {
          this.photoStreamUserUploaders[index] = imageUrl;
        }
        observer.next();
        observer.complete();
      };
      img.onerror = () => {
        const defaultImageUrl =
          'https://st3.depositphotos.com/1767687/16607/v/450/depositphotos_166074422-stock-illustration-default-avatar-profile-icon-grey.jpg';
        if (type === 'editor-choice') {
          this.photoStreamEditorChoiceUploaders[index] = defaultImageUrl;
        } else if (type === 'trending') {
          this.photoStreamTrendingUploaders[index] = defaultImageUrl;
        } else if (type === 'user') {
          this.photoStreamUserUploaders[index] = defaultImageUrl;
        }
        observer.next();
        observer.complete();
      };
      img.src = imageUrl;
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
}
