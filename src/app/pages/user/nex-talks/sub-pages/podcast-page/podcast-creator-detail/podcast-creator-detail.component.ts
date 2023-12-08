import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  faChevronRight,
  faEllipsis,
  faPause,
  faPlay,
} from '@fortawesome/free-solid-svg-icons';
import { KeycloakService } from 'keycloak-angular';
import { PlyrComponent } from 'ngx-plyr';
import { Subject, Subscription, takeUntil, tap } from 'rxjs';
import { CreatorDTO } from 'src/app/core/dtos/nex-talk/creator.dto';
import { PodcastDTO } from 'src/app/core/dtos/nex-talk/podcast.dto';
import { SerieDTO } from 'src/app/core/dtos/nex-talk/serie.dto';
import { CreatorDataService } from 'src/app/core/services/nex-talk/creator-data.service';
import { PodcastDataService } from 'src/app/core/services/nex-talk/podcast-data.service';
import { SerieDataService } from 'src/app/core/services/nex-talk/serie-data.service';
import { environment } from 'src/environments/environment.prod';
import { faPencil } from '@fortawesome/free-solid-svg-icons';
import { PlayerService } from 'src/app/core/services/nex-talk/player.service';
import { PodcastStoreModel } from '../../../store/podcast/podcast-store.model';
import { Store } from '@ngrx/store';
import {
  changeCurrentPage,
  changeCurrentPlayingPodcastList,
  changeIndexPodcastToPlay,
  changeIndexSerieToPlay,
  changePlayCount,
  changePodcastCreatorList,
  changePodcastToPlay,
  changeSerieCreatorList,
  changeSerieDetail,
  changeSerieList,
  changeSerieToPlay,
  changeStillPlaying,
} from '../../../store/podcast/podcast.actions';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-podcast-creator-detail',
  templateUrl: './podcast-creator-detail.component.html',
  styleUrls: ['./podcast-creator-detail.component.css'],
})
export class PodcastCreatorDetailComponent implements OnInit, OnDestroy {
  faPlay = faPlay;
  faPause = faPause;
  faEllipsis = faEllipsis;
  faChevronRight = faChevronRight;
  faPencil = faPencil;

  podcastSubscribe!: Subscription;
  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  //#region ------------- Creator Detail --------------------
  //uuid from URL
  uuid: string | null;
  creatorDetailData: CreatorDTO | undefined;
  isCreatorDetailLoading: boolean;
  isCreatorDetailError: boolean;
  //#endregion ---------- Creator Detail --------------------

  //#region ------------- Serie List --------------------
  isSerieListLoading: boolean;
  selectedSerieData: SerieDTO | undefined;
  //#endregion ---------- Serie List --------------------

  //#region ------------- Podcast List --------------------
  isPodcastListLoading: boolean;
  isDeletePodcastLoading: boolean;
  isPodcastListDurationLoading: boolean;
  //#endregion ---------- Podcast List --------------------

  userPersonalNumber: string;

  //#region ------------- State Management ------------------
  playCount: number;
  currentIndexPodcastToPlay: number;
  selectedPodcastToPlay: PodcastDTO | undefined;
  selectedSerieToPlay: SerieDTO | undefined;
  isStillPlaying: boolean;
  currentIndexSerieToPlay: number;
  serieListData: SerieDTO[];
  podcastCurrentPlayList: PodcastDTO[];
  podcastListData: PodcastDTO[];
  //#endregion ---------- State Management ------------------

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly podcastDataService: PodcastDataService,
    private readonly serieDataService: SerieDataService,
    private readonly creatorDataService: CreatorDataService,
    private readonly keycloakService: KeycloakService,
    private readonly playerService: PlayerService,
    private readonly store: Store<{ podcast: PodcastStoreModel }>
  ) {
    this.uuid = this.route.snapshot.paramMap.get('uuid');
    this.userPersonalNumber = '';
    this.isCreatorDetailLoading = false;
    this.isCreatorDetailError = false;
    this.serieListData = [];
    this.isSerieListLoading = false;
    this.podcastListData = [];
    this.isPodcastListLoading = false;
    this.isPodcastListDurationLoading = false;
    this.playCount = 0;
    this.currentIndexPodcastToPlay = 0;
    this.isDeletePodcastLoading = false;
    this.podcastCurrentPlayList = [];
    this.currentIndexSerieToPlay = 0;
    this.isStillPlaying = false;
  }

  ngOnInit(): void {
    this.initializeUser();
    this.initCreatorDetailData();

    this.onChangePodcastPage('podcast-creator-detail-page');
    this.podcastSubscribe = this.store.select('podcast').subscribe((data) => {
      this.currentIndexPodcastToPlay = data.currentIndexPodcastToPlay;
      this.selectedPodcastToPlay = data.selectedPodcastToPlay;
      this.selectedSerieToPlay = data.selectedSerieToPlay;
      this.isStillPlaying = data.isStillPlaying;
      this.currentIndexSerieToPlay = data.currentIndexSerieToPlay;
      this.serieListData = data.serieCreatorList;
      this.podcastCurrentPlayList = data.currentPlayingPodcastList;
      this.podcastListData = data.podcastCreatorList;
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

  onChangeStillPlaying(value: boolean) {
    this.store.dispatch(changeStillPlaying({ status: value }));
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

  onChangeIndexSerieToPlay(index: number) {
    this.store.dispatch(changeIndexSerieToPlay({ index: index }));
  }

  onChangeSerieToPlay(serie: SerieDTO) {
    this.store.dispatch(changeSerieToPlay({ selectedSerieToPlay: serie }));
  }

  onChangeSerieList(serieList: SerieDTO[]) {
    this.store.dispatch(changeSerieList({ serieList: serieList }));
  }

  onChangeSerieDetail(serie: SerieDTO) {
    this.store.dispatch(changeSerieDetail({ serie: serie }));
  }

  onChangeSerieCreatorList(serieList: SerieDTO[]) {
    this.store.dispatch(changeSerieCreatorList({ serieList: serieList }));
  }

  onChangePodcastCreatorList(podcastList: PodcastDTO[]) {
    this.store.dispatch(changePodcastCreatorList({ podcastList: podcastList }));
  }
  //#endregion ------------- State Management ------------------

  //GET Personal Number from Keycloak
  private initializeUser(): void {
    this.userPersonalNumber = this.keycloakService.getUsername();
  }

  onGotoPodcastDetail(uuid: string): void {
    this.router.navigate(['/user/nex-talks/podcast/list/detail/' + uuid]);
  }

  onGoToMyPodcastDetail(uuid: string): void {
    this.router.navigate(['/user/nex-talks/podcast/my-podcast/detail/' + uuid]);
  }

  initCreatorDetailData(): void {
    if (this.uuid) {
      this.isCreatorDetailLoading = true;
      this.isCreatorDetailError = false;
      this.creatorDataService
        .getCreatorDetailByUuid(this.uuid)
        .pipe(
          tap((response) => {
            response.data.path =
              environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' +
              response.data.path;
          }),
          takeUntil(this._onDestroy$)
        )
        .subscribe(
          (response) => {
            this.isCreatorDetailLoading = false;
            this.creatorDetailData = response.data;
            this.initSerieListData();
          },
          () => {
            this.isCreatorDetailLoading = false;
            this.isCreatorDetailError = true;
          }
        );
    }
  }

  initSerieListData(): void {
    if (this.creatorDetailData) {
      let params: string = `page=${1}&limit=${
        this.creatorDetailData.series.length
      }&status=${true}&serie_id=${
        this.creatorDetailData.id
      }&approval_status=Approved`;

      this.isSerieListLoading = true;
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

              this.isPodcastListDurationLoading = true;
            });
          }),
          takeUntil(this._onDestroy$)
        )
        .subscribe(
          (response) => {
            this.isSerieListLoading = false;
            const serieList = response.data.data;
            this.onChangeSerieCreatorList(serieList);
            if (serieList.length > 0) {
              this.selectedSerieData = serieList[0];
              this.initPodcastListData(serieList[0], false);
            }
          },
          (error) => {
            this.isSerieListLoading = false;
          }
        );
    }
  }

  initPodcastListData(serie: SerieDTO, wantToPlay: boolean): void {
    if (this.creatorDetailData) {
      let params: string = `page=${1}&limit=${
        serie.seriesPodcast.length
      }&status=${true}&serie_id=${serie.id}&approval_status=Approved`;

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
              element.isPause = false;

              element.duration = '00:00';

              if (this.selectedPodcastToPlay?.id === element.id) {
                element.isPause = this.selectedPodcastToPlay.isPause;
              } else {
                element.isPause = false;
              }

              // this.isPodcastListDurationLoading = true;
              // this.podcastDataService
              //   .getPodcastDurationFromUrl(element.pathFile)
              //   .subscribe(
              //     (duration) => {
              //       this.isPodcastListDurationLoading = false;
              //       element.duration = this.formatDuration(duration);
              //     },
              //     (error) => {
              //       this.isPodcastListDurationLoading = false;
              //     }
              //   );
            });
          }),
          takeUntil(this._onDestroy$)
        )
        .subscribe(
          (response) => {
            this.isPodcastListLoading = false;
            const podcastList = response.data.data;
            this.onChangePodcastCreatorList(podcastList);
            if (podcastList.length > 0 && wantToPlay) {
              this.onChangeSerieToPlay(serie);
              //this.onChangeCurrentPlayingPodcastList(this.podcastListData);
              this.playAllPodcasts(this.currentIndexSerieToPlay);
            }
          },
          (error) => {
            this.isPodcastListLoading = false;
          }
        );
    }
  }

  onSelectSeriePodcast(serie: SerieDTO, index: number): void {
    if (this.selectedSerieData) {
      if (serie.id !== this.selectedSerieData.id) {
        this.selectedSerieData = serie;
        this.initPodcastListData(serie, false);
      }
    }
  }

  onSelectPodcastListToPlayBySerie(serie: SerieDTO, index: number): void {
    if (this.selectedSerieData) {
      this.onChangeIndexSerieToPlay(index);
      if (serie.id !== this.selectedSerieData.id) {
        this.selectedSerieData = serie;
        this.initPodcastListData(serie, true);
      } else {
        if (this.podcastListData.length > 0) {
          this.playAllPodcasts(index);
        }
      }
    }
  }

  playAllPodcasts(index: number) {
    if (this.serieListData[index].isPause) {
      if (this.playerService.getPlayer()) {
        this.playerService.pausePlayer();
      }
    } else {
      if (this.currentIndexPodcastToPlay < this.podcastListData.length) {
        const index = this.podcastListData.findIndex(
          (item) => item.id === this.selectedPodcastToPlay?.id
        );

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

        this.clearSeriePauseFlags();

        if (this.podcastCurrentPlayList !== this.podcastListData) {
          this.onChangeCurrentPlayingPodcastList(this.podcastListData);
        }
      } else {
        if (this.playerService.getPlayer()) {
          this.playerService.playPlayer();
        }
      }
    }
  }

  onSelectPodcastToPlay(podcastList: PodcastDTO[], index: number) {
    const indexSerie = this.serieListData.findIndex(
      (serie) => serie.id === this.selectedSerieData?.id
    );

    if (indexSerie !== -1) {
      this.clearSeriePauseFlags();

      if (podcastList[index].isPause) {
        // state for pause state
        if (this.playerService.getPlayer()) {
          this.playerService.pausePlayer();
        }
      } else {
        if (this.selectedPodcastToPlay?.id !== podcastList[index].id) {
          // play new podcast
          this.onChangePlayCount(0);
          this.onChangePodcastToPlay(podcastList[index]);

          this.clearPodcastPauseFlags();

          this.onChangeIndexPodcastToPlay(index);
          this.onChangeIndexSerieToPlay(indexSerie);

          if (this.podcastCurrentPlayList !== podcastList) {
            this.onChangeCurrentPlayingPodcastList(this.podcastListData);
          }
        } else {
          // continue play current podcast
          if (this.playerService.getPlayer()) {
            this.playerService.playPlayer();
          }
        }
      }
    }
  }

  private clearSeriePauseFlags() {
    const serieList = this.serieListData.map((serie) => ({
      ...serie,
      isPause: false,
    }));
    this.onChangeSerieCreatorList(serieList);
  }

  private clearPodcastPauseFlags() {
    const podcastList = this.podcastListData.map((podcast) => ({
      ...podcast,
      isPause: false,
    }));
    this.onChangePodcastCreatorList(podcastList);
  }

  formatDuration(durationInSeconds: number): string {
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = Math.floor(durationInSeconds % 60);

    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

    return `${formattedMinutes}:${formattedSeconds}`;
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
}
