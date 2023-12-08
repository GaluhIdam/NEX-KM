import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  faPlay,
  faEllipsis,
  faChevronRight,
  faPause,
} from '@fortawesome/free-solid-svg-icons';
import { PlyrComponent } from 'ngx-plyr';
import * as Plyr from 'plyr';
import { Subject, Subscription, takeUntil, tap } from 'rxjs';
import { PodcastDTO } from 'src/app/core/dtos/nex-talk/podcast.dto';
import { SerieDTO } from 'src/app/core/dtos/nex-talk/serie.dto';
import { PlayerService } from 'src/app/core/services/nex-talk/player.service';
import { PodcastDataService } from 'src/app/core/services/nex-talk/podcast-data.service';
import { SerieDataService } from 'src/app/core/services/nex-talk/serie-data.service';
import { environment } from 'src/environments/environment.prod';
import { PodcastStoreModel } from '../../../store/podcast/podcast-store.model';
import { Store } from '@ngrx/store';
import {
  changeCurrentPage,
  changeCurrentPlayingPodcastList,
  changeIndexPodcastToPlay,
  changeIndexSerieToPlay,
  changePlayCount,
  changePodcastToPlay,
  changeSerieDetail,
  changeSerieList,
  changeSerieToPlay,
  changeStillPlaying,
} from '../../../store/podcast/podcast.actions';
import { Modal, initTE, Ripple } from 'tw-elements';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-podcast-list-detail',
  templateUrl: './podcast-list-detail.component.html',
  styleUrls: ['./podcast-list-detail.component.css'],
})
export class PodcastListDetailComponent implements OnInit, OnDestroy {
  faPlay = faPlay;
  faPause = faPause;
  faEllipsis = faEllipsis;
  faChevronRight = faChevronRight;

  podcastSubscribe!: Subscription;
  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  //#region ------------- Podcast Detail --------------------
  //uuid from URL
  uuid: string | null;
  serieDetailData: SerieDTO | undefined;
  isSerieDetailLoading: boolean;
  isSerieDetailError: boolean;
  //#endregion ---------- Podcast Detail --------------------

  //#region ------------- Podcast List --------------------
  podcastListData: PodcastDTO[];
  isPodcastListLoading: boolean;
  isDeletePodcastLoading: boolean;
  isPodcastListDurationLoading: boolean;
  //#endregion ---------- Podcast List --------------------

  //#region ------------- State Management ------------------
  playCount: number;
  currentIndexPodcastToPlay: number;
  selectedPodcastToPlay: PodcastDTO | undefined;
  selectedSerieToPlay: SerieDTO | undefined;
  isStillPlaying: boolean;
  serieList: SerieDTO[];
  //#endregion ---------- State Management ------------------

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly podcastDataService: PodcastDataService,
    private readonly serieDataService: SerieDataService,
    private readonly playerService: PlayerService,
    private readonly store: Store<{ podcast: PodcastStoreModel }>
  ) {
    this.uuid = this.route.snapshot.paramMap.get('uuid');
    this.isSerieDetailLoading = false;
    this.isSerieDetailError = false;
    this.podcastListData = [];
    this.isPodcastListLoading = false;
    this.isPodcastListDurationLoading = false;
    this.playCount = 0;
    this.currentIndexPodcastToPlay = 0;
    this.isDeletePodcastLoading = false;
    this.isStillPlaying = false;
    this.serieList = [];
  }

  ngOnInit(): void {
    initTE({ Modal, Ripple });
    this.initSerieDetailData(true);

    this.onChangePodcastPage('podcast-detail-page');
    this.podcastSubscribe = this.store.select('podcast').subscribe((data) => {
      this.currentIndexPodcastToPlay = data.currentIndexPodcastToPlay;
      this.selectedPodcastToPlay = data.selectedPodcastToPlay;
      this.selectedSerieToPlay = data.selectedSerieToPlay;
      this.isStillPlaying = data.isStillPlaying;
      this.serieList = data.serieList;
      this.serieDetailData = data.serieDetail;
      this.podcastListData =
        this.serieDetailData?.id === this.selectedSerieToPlay?.id
          ? data.currentPlayingPodcastList
          : this.podcastListData;
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
  //#endregion ------------- State Management ------------------

  initSerieDetailData(refresh?: boolean): void {
    if (this.uuid) {
      if (refresh !== undefined && refresh === true) {
        this.isSerieDetailLoading = true;
        this.isSerieDetailError = false;
      }
      this.serieDataService
        .getSerieDetailByUuid(this.uuid)
        .pipe(
          tap((response) => {
            response.data.path =
              environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' +
              response.data.path;

            if (this.selectedSerieToPlay?.id === response.data.id) {
              response.data.isPause = this.selectedSerieToPlay.isPause;
            } else {
              response.data.isPause = false;
            }
          }),
          takeUntil(this._onDestroy$)
        )
        .subscribe(
          (response) => {
            if (refresh !== undefined && refresh === true) {
              this.isSerieDetailLoading = false;
            }
            this.onChangeSerieDetail(response.data);
            this.initPodcastListData(refresh);
          },
          () => {
            if (refresh !== undefined && refresh === true) {
              this.isSerieDetailLoading = false;
              this.isSerieDetailError = true;
            }
          }
        );
    }
  }

  initPodcastListData(refresh?: boolean): void {
    if (this.serieDetailData) {
      if (refresh) {
        this.isPodcastListLoading = true;
      }
      let params: string = `page=${1}&limit=${
        this.serieDetailData.seriesPodcast.length
      }&status=${true}&serie_id=${
        this.serieDetailData.id
      }&approval_status=Approved`;

      this.podcastDataService
        .getPodcastData(params)
        .pipe(
          tap((response) => {
            response.data.data.map((element, index) => {
              element.pathImage =
                environment.httpUrl +
                '/v1/api/file-manager/get-imagepdf/' +
                element.pathImage;
              element.pathFile =
                environment.httpUrl +
                '/v1/api/file-manager/get-m3u8/' +
                element.pathFile;

              element.duration = '00:00';

              if (this.selectedPodcastToPlay?.id === element.id) {
                element.isPause = this.selectedPodcastToPlay.isPause;
              } else {
                element.isPause = false;
              }

              if (refresh) {
                this.isPodcastListDurationLoading = true;
              }
              this.podcastDataService
                .getPodcastDurationFromUrl(element.pathFile)
                .subscribe(
                  (duration) => {
                    if (refresh) {
                      this.isPodcastListDurationLoading = false;
                    }
                    element.duration = this.formatDuration(duration);
                  },
                  (error) => {
                    if (refresh) {
                      this.isPodcastListDurationLoading = false;
                    }
                  }
                );
            });
          }),
          takeUntil(this._onDestroy$)
        )
        .subscribe(
          (response) => {
            this.podcastListData = response.data.data;
            if (refresh) {
              this.isPodcastListLoading = false;
            }
          },
          (error) => {
            if (refresh) {
              this.isPodcastListLoading = false;
            }
          }
        );
    }
  }

  onSelectPodcastListToPlay() {
    if (this.serieDetailData) {
      if (this.selectedSerieToPlay?.id !== this.serieDetailData.id) {
        const podcastList = this.podcastListData;

        if (podcastList.length > 0) {
          this.onChangeCurrentPlayingPodcastList(podcastList);
          this.onChangeSerieToPlay(this.serieDetailData);
          this.playAllPodcasts();
        }
      } else {
        if (this.podcastListData.length > 0) {
          this.playAllPodcasts();
        }
      }
    }
  }

  playAllPodcasts() {
    if (this.serieDetailData) {
      if (this.serieDetailData.isPause) {
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
        } else {
          if (this.playerService.getPlayer()) {
            this.playerService.playPlayer();
          }
        }
      }
    }
  }

  onSelectPodcastToPlay(podcast: PodcastDTO | undefined, index: number) {
    if (this.serieDetailData) {
      if (this.selectedSerieToPlay?.id !== this.serieDetailData.id) {
        const podcastList = this.podcastListData;
        if (podcastList.length > 0) {
          this.onChangeCurrentPlayingPodcastList(podcastList);
          this.onChangeSerieToPlay(this.serieDetailData);
          this.playSelectedPodcast(podcast, index);
        }
      } else {
        if (this.podcastListData.length > 0) {
          this.playSelectedPodcast(podcast, index);
        }
      }
    }
  }

  playSelectedPodcast(podcast: PodcastDTO | undefined, index: number) {
    if (this.serieDetailData) {
      if (this.podcastListData[index].isPause) {
        // state for pause state
        if (this.playerService.getPlayer()) {
          this.playerService.pausePlayer();
        }
      } else {
        if (this.selectedPodcastToPlay !== podcast) {
          // play new podcast
          this.onChangePlayCount(0);
          if (podcast) {
            this.onChangePodcastToPlay(podcast);
          }

          this.clearPauseFlags();

          this.onChangeIndexPodcastToPlay(index);
        } else {
          // continue play current podcast
          if (this.playerService.getPlayer()) {
            this.playerService.playPlayer();
          }
        }
      }
    }
  }

  private clearPauseFlags() {
    const podcastList = this.podcastListData.map((podcast) => ({
      ...podcast,
      isPause: false,
    }));
    this.onChangeCurrentPlayingPodcastList(podcastList);
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
