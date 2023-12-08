import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  faChevronRight,
  faEllipsis,
  faPause,
  faPlay,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import { Subject, Subscription, takeUntil, tap } from 'rxjs';
import { PodcastDTO } from 'src/app/core/dtos/nex-talk/podcast.dto';
import { SerieDTO } from 'src/app/core/dtos/nex-talk/serie.dto';
import { PodcastManageDTO } from '../podcast-manage/dto/podcast-manage.dto';
import { Router } from '@angular/router';
import { PodcastDataService } from 'src/app/core/services/nex-talk/podcast-data.service';
import { SerieDataService } from 'src/app/core/services/nex-talk/serie-data.service';
import { LocalService } from 'src/app/core/services/local/local.service';
import { KeycloakService } from 'keycloak-angular';
import { environment } from 'src/environments/environment.prod';
import { Store } from '@ngrx/store';
import { PodcastStoreModel } from '../../../store/podcast/podcast-store.model';
import { PlayerService } from '../../../../../../core/services/nex-talk/player.service';
import {
  changeCurrentPage,
  changeCurrentPlayingPodcastList,
  changeIndexPodcastToPlay,
  changeIndexSerieToPlay,
  changePlayCount,
  changePodcastToPlay,
  changeSerieLastReleaseList,
  changeSerieList,
  changeSerieToPlay,
  changeSerieTypePlaying,
  changeSerieUserList,
} from '../../../store/podcast/podcast.actions';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-podcast-serie-list',
  templateUrl: './podcast-serie-list.component.html',
  styleUrls: ['./podcast-serie-list.component.css'],
})
export class PodcastSerieListComponent implements OnInit, OnDestroy {
  faEllipsis = faEllipsis;
  faSearch = faSearch;
  faChevronRight = faChevronRight;
  faPlay = faPlay;
  faPause = faPause;

  podcastSubscribe!: Subscription;
  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  //#region ------------- Podcast List -------------------
  serieListData: SerieDTO[];
  isSerieListLoading: boolean;
  //#endregion ---------- Podcast List -------------------

  //#region ------------- Podcast Last Release ------------------
  serieLastReleaseData: SerieDTO[];
  isSerieLastReleaseLoading: boolean;
  //#endregion ---------- Podcast Last Relase -------------------

  //#region ------------- Podcast Last Play ------------------
  podcastLastPlayData: PodcastDTO[];
  isPodcastLastPlayLoading: boolean;
  isTherePodcastPlayed: boolean;
  //#endregion ---------- Podcast Last Play ------------------

  //#region ------------- Podcast Liked ------------------
  podcastLikedData: PodcastDTO[];
  isPodcastLikedLoading: boolean;
  isTherePodcastLiked: boolean;
  //#endregion ---------- Podcast Liked ------------------

  //#region ------------- Podcast User ------------------
  serieUserData: SerieDTO[];
  isSerieUserLoading: boolean;
  //#endregion ---------- Podcast User ------------------

  userPersonalNumber: string;

  isPodcastListLoading: boolean;

  categoryData: PodcastManageDTO[] = [
    {
      name: 'Podcast List',
    },
    {
      name: 'Latest Release',
    },
    {
      name: 'Recently Played',
    },
    {
      name: 'Liked Podcast',
    },
  ];

  //#region ------------- State Management ------------------
  playCount: number;
  podcastListData: PodcastDTO[];
  currentIndexPodcastToPlay: number;
  selectedPodcastToPlay: PodcastDTO | undefined;
  selectedSerieToPlay: SerieDTO | undefined;
  isStillPlaying: boolean;
  //#endregion ---------- State Management ------------------

  constructor(
    private readonly router: Router,
    private readonly podcastDataService: PodcastDataService,
    private readonly serieDataService: SerieDataService,
    private readonly localService: LocalService,
    private readonly keycloakService: KeycloakService,
    private readonly playerService: PlayerService,
    private readonly store: Store<{ podcast: PodcastStoreModel }>
  ) {
    this.serieListData = [];
    this.isSerieListLoading = false;
    this.serieLastReleaseData = [];
    this.isSerieLastReleaseLoading = false;
    this.userPersonalNumber = '';
    this.serieUserData = [];
    this.isSerieUserLoading = false;
    this.podcastLastPlayData = [];
    this.isPodcastLastPlayLoading = false;
    this.isTherePodcastPlayed = false;
    this.podcastLikedData = [];
    this.isPodcastLikedLoading = false;
    this.isTherePodcastLiked = false;
    this.isPodcastListLoading = false;
    this.podcastListData = [];
    this.playCount = 0;
    this.currentIndexPodcastToPlay = 0;
    this.isStillPlaying = false;
  }

  ngOnInit(): void {
    this.initializeUser();
    this.initSerieListData();
    this.initSerieLastReleaseData();
    this.initSerieUserData();
    this.initPodcastLastPlayData();
    this.initPodcastLikedData();

    this.onChangePodcastPage('podcast-page');
    this.podcastSubscribe = this.store.select('podcast').subscribe((data) => {
      this.currentIndexPodcastToPlay = data.currentIndexPodcastToPlay;
      this.podcastListData = data.currentPlayingPodcastList;
      this.selectedPodcastToPlay = data.selectedPodcastToPlay;
      this.serieListData = data.serieList;
      this.serieLastReleaseData = data.serieLastReleaseList;
      this.serieUserData = data.serieUserList;
      this.selectedSerieToPlay = data.selectedSerieToPlay;
      this.isStillPlaying = data.isStillPlaying;
    });
  }

  ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();

    if (this.podcastSubscribe) {
      this.podcastSubscribe.unsubscribe();
    }
  }

  //#region ------------- State Management ------------------
  onChangePodcastPage(value: string) {
    this.store.dispatch(changeCurrentPage({ page: value }));
  }

  onChangePlayCount(value: number) {
    this.store.dispatch(changePlayCount({ count: value }));
  }

  onChangeIndexPodcastToPlay(index: number) {
    this.store.dispatch(changeIndexPodcastToPlay({ index: index }));
  }

  onChangeCurrentPlayingPodcastList(podcastList: PodcastDTO[]) {
    this.store.dispatch(
      changeCurrentPlayingPodcastList({ podcastList: podcastList })
    );
  }

  onChangePodcastToPlay(podcast: PodcastDTO) {
    this.store.dispatch(
      changePodcastToPlay({ selectedPodcastToPlay: podcast })
    );
  }

  onChangeSerieTypePlaying(type: string) {
    this.store.dispatch(changeSerieTypePlaying({ serieType: type }));
  }

  onChangeIndexSerieToPlay(index: number) {
    this.store.dispatch(changeIndexSerieToPlay({ index: index }));
  }

  onChangeSerieToPlay(serie: SerieDTO) {
    this.store.dispatch(changeSerieToPlay({ selectedSerieToPlay: serie }));
  }

  onChangeSerieList(serieList: SerieDTO[]) {
    this.store.dispatch(changeSerieList({ serieList: serieList }));
  }

  onChangeSerieLastReleaseList(serieList: SerieDTO[]) {
    this.store.dispatch(changeSerieLastReleaseList({ serieList: serieList }));
  }

  onChangeSerieUserList(serieList: SerieDTO[]) {
    this.store.dispatch(changeSerieUserList({ serieList: serieList }));
  }
  //#endregion ------------- State Management ------------------

  //GET Personal Number from Keycloak
  private initializeUser(): void {
    this.userPersonalNumber = this.keycloakService.getUsername();
  }

  podcastList(): void {
    this.localService.saveData(
      'selected_manage_podcast_category',
      JSON.stringify(this.categoryData[0])
    );
    this.router.navigate(['/user/nex-talks/podcast/list']);
  }

  podcastLatestRelease(): void {
    this.localService.saveData(
      'selected_manage_podcast_category',
      JSON.stringify(this.categoryData[1])
    );
    this.router.navigate(['/user/nex-talks/podcast/list']);
  }

  podcastRecentlyPlayed(): void {
    this.localService.saveData(
      'selected_manage_podcast_category',
      JSON.stringify(this.categoryData[2])
    );
    this.router.navigate(['/user/nex-talks/podcast/list']);
  }

  podcastLikedPodcast(): void {
    this.localService.saveData(
      'selected_manage_podcast_category',
      JSON.stringify(this.categoryData[3])
    );
    this.router.navigate(['/user/nex-talks/podcast/list']);
  }

  podcastMyPodcast(): void {
    this.router.navigate(['/user/nex-talks/podcast/my-podcast']);
  }

  initSerieListData(): void {
    this.isSerieListLoading = true;
    let params: string = `page=${1}&limit=${4}&status=${true}&approval_status=Approved`;

    this.serieDataService
      .getSerieData(params)
      .pipe(
        tap((response) => {
          response.data.data.map((element) => {
            element.path =
              environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' +
              element.path;

            if (this.selectedSerieToPlay?.id === element.id) {
              element.isPause = this.selectedSerieToPlay.isPause;
            } else {
              element.isPause = false;
            }
          });
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe(
        (response) => {
          this.isSerieListLoading = false;
          this.onChangeSerieList(response.data.data);
        },
        (error) => {
          this.isSerieListLoading = false;
        }
      );
  }

  initSerieLastReleaseData(): void {
    this.isSerieLastReleaseLoading = true;
    let params: string = `page=${1}&limit=${6}&status=${true}&order_by=desc&approval_status=Approved`;

    this.serieDataService
      .getSerieData(params)
      .pipe(
        tap((response) => {
          response.data.data.map((element) => {
            element.path =
              environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' +
              element.path;

            if (this.selectedSerieToPlay?.id === element.id) {
              element.isPause = this.selectedSerieToPlay.isPause;
            } else {
              element.isPause = false;
            }
          });
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe(
        (response) => {
          this.isSerieLastReleaseLoading = false;
          this.onChangeSerieLastReleaseList(response.data.data);
        },
        (error) => {
          this.isSerieLastReleaseLoading = false;
        }
      );
  }

  initSerieUserData(): void {
    this.isSerieUserLoading = true;
    let params: string = `page=${1}&limit=${6}&status=${true}&personal_number=${
      this.userPersonalNumber
    }`;

    this.serieDataService
      .getSerieData(params)
      .pipe(
        tap((response) => {
          response.data.data.map((element) => {
            element.path =
              environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' +
              element.path;

            if (this.selectedSerieToPlay?.id === element.id) {
              element.isPause = this.selectedSerieToPlay.isPause;
            } else {
              element.isPause = false;
            }
          });
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe(
        (response) => {
          this.isSerieUserLoading = false;
          this.onChangeSerieUserList(response.data.data);
        },
        (error) => {
          this.isSerieUserLoading = false;
        }
      );
  }

  initPodcastLastPlayData(): void {
    this.isPodcastLastPlayLoading = true;
    this.isTherePodcastPlayed = false;
    let params: string = `page=${1}&limit=${4}&status=${true}&order_by=lastPlayed&approval_status=Approved`;

    this.podcastDataService
      .getPodcastData(params)
      .pipe(
        tap((response) => {
          response.data.data.map((element) => {
            element.pathImage =
              environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' +
              element.pathImage;
            element.pathFile =
              environment.httpUrl +
              '/v1/api/file-manager/get-m3u8/' +
              element.pathFile;

            if (element.updatedAt !== element.createdAt) {
              this.isTherePodcastPlayed = true;
            }
          });
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe((response) => {
        this.podcastLastPlayData = response.data.data;
        this.isPodcastLastPlayLoading = false;
      });
  }

  initPodcastLikedData(): void {
    this.isPodcastLikedLoading = true;
    this.isTherePodcastLiked = false;
    let params: string = `page=${1}&limit=${4}&status=${true}&order_by=mostLiked&approval_status=Approved`;

    this.podcastDataService
      .getPodcastData(params)
      .pipe(
        tap((response) => {
          response.data.data.map((element) => {
            element.pathImage =
              environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' +
              element.pathImage;
            element.pathFile =
              environment.httpUrl +
              '/v1/api/file-manager/get-m3u8/' +
              element.pathFile;

            if (element.likeCount > 0) {
              this.isTherePodcastLiked = true;
            }
          });
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe((response) => {
        this.podcastLikedData = response.data.data;
        this.isPodcastLikedLoading = false;
      });
  }

  podcastPlayingAlert() {
    Swal.fire({
      icon: 'warning',
      title: 'Podcast still playing',
      text: 'Please pause or wait for the podcast to finish before taking any action',
    });
  }

  onGoHomePage(): void {
    if (this.isStillPlaying) {
      this.podcastPlayingAlert();
    } else {
      this.router.navigate(['/']);
    }
  }

  onGoToNexTalkPage(): void {
    if (this.isStillPlaying) {
      this.podcastPlayingAlert();
    } else {
      this.router.navigate(['/user/nex-talks']);
    }
  }

  onGotoPodcastDetail(uuid: string): void {
    this.router.navigate(['/user/nex-talks/podcast/list/detail/' + uuid]);
  }

  onGoToMyPodcastDetail(uuid: string): void {
    this.router.navigate(['/user/nex-talks/podcast/my-podcast/detail/' + uuid]);
  }

  onGoCreatorDetail(uuid: string) {
    this.router.navigate(['/user/nex-talks/podcast/creator/detail/' + uuid]);
  }

  onSelectPodcastListToPlay(
    type: string,
    serie: SerieDTO,
    index: number
  ): void {
    this.onChangeIndexSerieToPlay(index);
    if (this.selectedSerieToPlay?.id !== serie.id) {
      this.initPodcastListData(type, serie, index);
    } else {
      if (this.podcastListData.length > 0) {
        this.playAllPodcasts(type, index);
      }
    }
  }

  initPodcastListData(type: string, serie: SerieDTO, indexSerie: number): void {
    let params: string = `page=${1}&limit=${
      serie.seriesPodcast.length
    }&status=${true}&serie_id=${serie.id}`;

    this.isPodcastListLoading = true;
    this.podcastDataService
      .getPodcastData(params)
      .pipe(
        tap((response) => {
          response.data.data.map((element) => {
            element.pathImage =
              environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' +
              element.pathImage;
            element.pathFile =
              environment.httpUrl +
              '/v1/api/file-manager/get-m3u8/' +
              element.pathFile;

            if (this.selectedPodcastToPlay?.id === element.id) {
              element.isPause = this.selectedPodcastToPlay.isPause;
            } else {
              element.isPause = false;
            }

            element.duration = '00:00';

            this.podcastDataService
              .getPodcastDurationFromUrl(element.pathFile)
              .subscribe(
                (duration) => {
                  element.duration = this.formatDuration(duration);
                },
                (error) => {
                  element.duration = '00:00';
                }
              );
          });
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe(
        (response) => {
          this.isPodcastListLoading = false;
          const podcastList = response.data.data;
          if (podcastList.length > 0) {
            this.onChangeSerieToPlay(serie);
            this.onChangeCurrentPlayingPodcastList(podcastList);
            this.playAllPodcasts(type, indexSerie);
          }
        },
        (error) => {
          this.isPodcastListLoading = false;
        }
      );
  }

  playAllPodcasts(type: string, indexSerie: number) {
    this.onChangeSerieTypePlaying(type);
    const serieData = this.getSerieData(type);

    if (!serieData) return;

    if (serieData[indexSerie].isPause) {
      if (this.playerService.getPlayer()) {
        this.playerService.pausePlayer();
      }
    } else {
      if (this.currentIndexPodcastToPlay < this.podcastListData.length) {
        const index = this.findIndexOfSelectedPodcast();
        if (index !== -1) {
          this.onChangeIndexPodcastToPlay(index);
        } else {
          this.onChangeIndexPodcastToPlay(0);
        }
      } else {
        this.onChangeIndexPodcastToPlay(0);
      }

      if (
        this.selectedPodcastToPlay?.id !==
        this.podcastListData[this.currentIndexPodcastToPlay].id
      ) {
        this.onChangePlayCount(0);
        this.onChangePodcastToPlay(
          this.podcastListData[this.currentIndexPodcastToPlay]
        );

        this.clearPauseFlags();

        const updateSerieList = serieData.map((serie, index) => ({
          ...serie,
          isPause: index === indexSerie ? true : false,
        }));

        if (type === 'list') {
          this.onChangeSerieList(updateSerieList);
        } else if (type === 'last-release') {
          this.onChangeSerieLastReleaseList(updateSerieList);
        } else if (type === 'user') {
          this.onChangeSerieUserList(updateSerieList);
        }
      } else {
        if (this.playerService.getPlayer()) {
          this.playerService.playPlayer();
        }
      }
    }
  }

  private getSerieData(type: string) {
    switch (type) {
      case 'list':
        return this.serieListData;
      case 'last-release':
        return this.serieLastReleaseData;
      case 'user':
        return this.serieUserData;
      default:
        return null;
    }
  }

  private findIndexOfSelectedPodcast() {
    return this.podcastListData.findIndex(
      (item) => item.id === this.selectedPodcastToPlay?.id
    );
  }

  private clearPauseFlags() {
    const serieList = this.serieListData.map((serie) => ({
      ...serie,
      isPause: false,
    }));
    this.onChangeSerieList(serieList);

    const serieLastReleaseList = this.serieLastReleaseData.map((serie) => ({
      ...serie,
      isPause: false,
    }));
    this.onChangeSerieLastReleaseList(serieLastReleaseList);

    const serieUserList = this.serieUserData.map((serie) => ({
      ...serie,
      isPause: false,
    }));
    this.onChangeSerieUserList(serieUserList);
  }

  formatDuration(durationInSeconds: number): string {
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = Math.floor(durationInSeconds % 60);

    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

    return `${formattedMinutes}:${formattedSeconds}`;
  }
}
