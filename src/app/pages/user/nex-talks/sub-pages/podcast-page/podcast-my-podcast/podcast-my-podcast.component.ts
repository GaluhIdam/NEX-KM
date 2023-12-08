import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { PlyrComponent } from 'ngx-plyr';
import * as Plyr from 'plyr';
import {
  faChevronRight,
  faEllipsis,
  faPause,
  faPlay,
  faPlus,
  faUpload,
  faVolumeHigh,
} from '@fortawesome/free-solid-svg-icons';
import { SerieDataService } from 'src/app/core/services/nex-talk/serie-data.service';
import { Subject, Subscription, takeUntil, tap } from 'rxjs';
import { PodcastDataService } from 'src/app/core/services/nex-talk/podcast-data.service';
import { LocalService } from 'src/app/core/services/local/local.service';
import { KeycloakService } from 'keycloak-angular';
import { PaginatorRequest } from 'src/app/core/requests/paginator.request';
import { ParamsRequest } from 'src/app/core/requests/params.request';
import { SerieDTO } from 'src/app/core/dtos/nex-talk/serie.dto';
import { environment } from 'src/environments/environment.prod';
import { PodcastDTO } from 'src/app/core/dtos/nex-talk/podcast.dto';
import { CreatorDataService } from 'src/app/core/services/nex-talk/creator-data.service';
import { CreatorDTO } from 'src/app/core/dtos/nex-talk/creator.dto';
import Swal from 'sweetalert2';
import { PlayerService } from 'src/app/core/services/nex-talk/player.service';
import { Store } from '@ngrx/store';
import { PodcastStoreModel } from '../../../store/podcast/podcast-store.model';
import {
  changeCurrentPage,
  changeCurrentPlayingPodcastList,
  changeIndexPodcastToPlay,
  changeIndexSerieToPlay,
  changePlayCount,
  changePodcastToPlay,
  changeSerieToPlay,
  changeSerieUserList,
  changeStillPlaying,
} from '../../../store/podcast/podcast.actions';

@Component({
  selector: 'app-podcast-my-podcast',
  templateUrl: './podcast-my-podcast.component.html',
  styleUrls: ['./podcast-my-podcast.component.css'],
})
export class PodcastMyPodcastComponent implements OnInit, OnDestroy {
  faEllipsis = faEllipsis;
  faPlus = faPlus;
  faUpload = faUpload;
  faChevronRight = faChevronRight;
  faPlay = faPlay;
  faPause = faPause;
  faVolumeHigh = faVolumeHigh;

  podcastSubscribe!: Subscription;
  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  paginator?: PaginatorRequest;
  dataRequest?: ParamsRequest;

  pages: Number[];

  creatorData: CreatorDTO[];

  selectedSerieData: SerieDTO | undefined;
  totalPodcast: number;

  userPersonalNumber: string;
  isLoading: boolean;
  isPodcastListLoading: boolean;
  isPodcastListDurationLoading: boolean;

  //#region ------------- State Management ------------------
  playCount: number;
  serieData: SerieDTO[];
  podcastListData: PodcastDTO[];
  currentIndexPodcastToPlay: number;
  selectedPodcastToPlay: PodcastDTO | undefined;
  selectedSerieToPlay: SerieDTO | undefined;
  isStillPlaying: boolean;
  //#endregion ---------- State Management ------------------

  constructor(
    private readonly router: Router,
    private readonly creatorDataService: CreatorDataService,
    private readonly serieDataService: SerieDataService,
    private readonly keycloakService: KeycloakService,
    private readonly podcastDataService: PodcastDataService,
    private readonly playerService: PlayerService,
    private readonly store: Store<{ podcast: PodcastStoreModel }>
  ) {
    this.creatorData = [];
    this.serieData = [];
    this.podcastListData = [];
    this.pages = [];
    this.userPersonalNumber = '';
    this.isLoading = false;
    this.isPodcastListLoading = false;
    this.isPodcastListDurationLoading = false;
    this.isStillPlaying = false;
    this.totalPodcast = 0;
    this.playCount = 0;
    this.currentIndexPodcastToPlay = 0;
  }

  ngOnInit(): void {
    this.initializeUser();
    this.initPaginator();
    this.initParams();
    this.initCreatorData();
    this.initSerieData();

    this.onChangePodcastPage('my-podcast-page');
    this.podcastSubscribe = this.store.select('podcast').subscribe((data) => {
      this.currentIndexPodcastToPlay = data.currentIndexPodcastToPlay;
      this.podcastListData = data.currentPlayingPodcastList;
      this.selectedPodcastToPlay = data.selectedPodcastToPlay;
      this.selectedSerieToPlay = data.selectedSerieToPlay;
      this.isStillPlaying = data.isStillPlaying;
      this.serieData = data.serieUserList;
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

  onChangeSerieUserList(serieList: SerieDTO[]) {
    this.store.dispatch(changeSerieUserList({ serieList: serieList }));
  }
  //#endregion ------------- State Management ------------------

  myPodcastDetail(serie: SerieDTO, uuid: string): void {
    this.selectedSerieData = serie;
    this.router.navigate(['/user/nex-talks/podcast/my-podcast/detail/' + uuid]);
  }

  createNewSeries(): void {
    this.router.navigate(['/user/nex-talks/podcast/my-podcast/create-series']);
  }

  createCreator(): void {
    this.router.navigate(['/user/nex-talks/podcast/my-podcast/create-creator']);
  }

  editCreator(): void {
    if (this.creatorData.length > 0) {
      this.router.navigate([
        '/user/nex-talks/podcast/my-podcast/edit-creator/' +
          this.creatorData[0].uuid,
      ]);
    }
  }

  uploadPodcast(): void {
    this.router.navigate(['/user/nex-talks/podcast/my-podcast/upload']);
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

  //GET Personal Number from Keycloak
  private initializeUser(): void {
    this.userPersonalNumber = this.keycloakService.getUsername();
  }

  initCreatorData(): void {
    let params: string = `page=${1}&limit=${1}`;

    if (this.userPersonalNumber !== '') {
      params += `&personal_number=${this.userPersonalNumber}`;
    }

    this.isLoading = true;
    this.creatorDataService
      .getCreatorData(params)
      .pipe(takeUntil(this._onDestroy$))
      .subscribe((response) => {
        this.isLoading = false;
        this.creatorData = response.data.data;
      });
  }

  initSerieData(): void {
    this.isLoading = true;
    let params: string = `page=${this.dataRequest?.page ?? 1}&limit=${
      this.dataRequest?.limit
    }`;

    if (this.userPersonalNumber !== '') {
      params += `&personal_number=${this.userPersonalNumber}`;
    }

    this.serieDataService
      .getSerieData(params)
      .pipe(
        tap((response) => {
          response.data.data.map((element) => {
            this.totalPodcast += element.seriesPodcast.length;
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
          this.isLoading = false;
          this.onChangeSerieUserList(response.data.data);
        },
        (error) => {
          this.isLoading = false;
        }
      );
  }

  //#region ------------- Paginator and Params ------------------
  initPaginator(): void {
    this.paginator = {
      pageOption: [16, 32, 64, 128],
      pageNumber: 1,
      pageSize: 16,
      totalData: 0,
      totalPage: 0,
    };
  }

  initParams(): void {
    if (this.paginator) {
      this.dataRequest = {
        limit: this.paginator.pageSize,
        page: this.paginator.pageNumber,
        offset: (this.paginator.pageNumber - 1) * this.paginator.pageSize,
      };
    }
  }

  changePageNumber(isNextPage: boolean): void {
    if (this.paginator) {
      if (isNextPage) {
        if (this.paginator) {
        }
        this.paginator.pageNumber++;
      } else {
        this.paginator.pageNumber--;
      }
    }

    this.rePaginate();
  }

  goToPageNumberByPageSelect(event: number): void {
    if (this.paginator) {
      this.paginator.pageNumber = Number(event);
      this.rePaginate();
    }
  }

  goToPageNumberByPageClick(event: any): void {
    if (this.paginator) {
      this.paginator.pageNumber = Number(event);
      this.rePaginate();
    }
  }

  changePageSize(): void {
    if (this.paginator) {
      this.paginator.pageNumber = 1;
      this.rePaginate();
    }
  }

  rePaginate(refresh?: boolean): void {
    if (this.paginator) {
      if (refresh) {
        this.paginator.pageNumber = 1;
        this.paginator.pageSize = 16;
      }

      if (this.dataRequest) {
        this.dataRequest.limit = this.paginator.pageSize;
        this.dataRequest.page = this.paginator.pageNumber;
        this.dataRequest.offset =
          (this.paginator.pageNumber - 1) * this.paginator.pageSize;
      }

      this.initSerieData();
    }
  }

  //#endregion ------------- Paginator and Params ------------------

  onClickAction(action: string) {
    if (this.isStillPlaying) {
      this.podcastPlayingAlert();
    } else {
      if (this.creatorData.length > 0) {
        if (this.creatorData[0].approvalStatus !== 'Approved') {
          Swal.fire({
            icon: 'info',
            title: 'Alert Confirmation',
            text:
              this.creatorData[0].approvalStatus === 'Rejected'
                ? 'Your Channel status has been rejected, so you cannot perform any actions'
                : 'Your Channel status is waiting for approval, so you cannot perform any actions yet',
          });
        } else {
          if (action === 'upload-podcast') {
            if (this.serieData.length > 0) {
              Swal.fire({
                icon: 'info',
                title: 'Alert Confirmation',
                text: 'Are you sure want to upload new podcast?',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'Yes',
                reverseButtons: true,
              }).then((result) => {
                if (result.isConfirmed) {
                  this.uploadPodcast();
                }
              });
            } else {
              Swal.fire({
                icon: 'info',
                title: 'Alert Confirmation',
                text: 'You dont have any series. Do you want to create a new series?',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonText: 'No',
                confirmButtonText: 'Create new series',
                reverseButtons: true,
              }).then((result) => {
                if (result.isConfirmed) {
                  this.createNewSeries();
                }
              });
            }
          } else if (action === 'create-series') {
            Swal.fire({
              icon: 'info',
              title: 'Alert Confirmation',
              text: 'Are you sure want to create new series?',
              showCancelButton: true,
              confirmButtonColor: '#d33',
              cancelButtonColor: '#3085d6',
              confirmButtonText: 'Yes',
              reverseButtons: true,
            }).then((result) => {
              if (result.isConfirmed) {
                this.createNewSeries();
              }
            });
          }
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Action Confirmation',
          text: 'Channel not exist. Please create the channel first',
        });
      }
    }
  }

  onCreateCreatorClick() {
    if (this.isStillPlaying) {
      this.podcastPlayingAlert();
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Alert Confirmation',
        text: 'Are you sure want to create a channel?',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes',
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          this.createCreator();
        }
      });
    }
  }

  onEditCreatorClick() {
    if (this.isStillPlaying) {
      this.podcastPlayingAlert();
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Edit Confirmation',
        text: 'Are you sure want to edit the channel?',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes',
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          this.editCreator();
        }
      });
    }
  }

  onSelectPodcastListToPlay(serie: SerieDTO, index: number): void {
    this.onChangeIndexSerieToPlay(index);
    if (this.selectedSerieToPlay?.id !== serie.id) {
      this.initPodcastListData(serie, index, true);
    } else {
      if (this.podcastListData.length > 0) {
        this.playAllPodcasts(index);
      }
    }
  }

  initPodcastListData(
    serie: SerieDTO,
    indexSerie: number,
    wantToPlay: boolean
  ): void {
    let params: string = `page=${1}&limit=${
      serie.seriesPodcast.length
    }&status=${true}&serie_id=${serie.id}`;

    if (this.userPersonalNumber !== '') {
      params += `&personal_number=${this.userPersonalNumber}`;
    }

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
          const podcastList = response.data.data;
          this.isPodcastListLoading = false;
          if (podcastList.length > 0 && wantToPlay) {
            this.onChangeCurrentPlayingPodcastList(podcastList);
            this.onChangeSerieToPlay(serie);
            this.playAllPodcasts(indexSerie);
          }
        },
        (error) => {
          this.isPodcastListLoading = false;
        }
      );
  }

  playAllPodcasts(indexSerie: number) {
    if (this.serieData[indexSerie].isPause) {
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

        this.clearPauseFlags();

        const updateSerieList = this.serieData.map((serie, index) => ({
          ...serie,
          isPause: index === indexSerie ? true : false,
        }));

        this.onChangeSerieUserList(updateSerieList);
      } else {
        if (this.playerService.getPlayer()) {
          this.playerService.playPlayer();
        }
      }
    }
  }

  podcastPlayingAlert() {
    Swal.fire({
      icon: 'warning',
      title: 'Podcast still playing',
      text: 'Please pause or wait for the podcast to finish before taking any action',
    });
  }

  formatDuration(durationInSeconds: number): string {
    const minutes = Math.floor(durationInSeconds / 60);
    const seconds = Math.floor(durationInSeconds % 60);

    const formattedMinutes = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const formattedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

    return `${formattedMinutes}:${formattedSeconds}`;
  }

  private clearPauseFlags() {
    const serieUserList = this.serieData.map((serie) => ({
      ...serie,
      isPause: false,
    }));
    this.onChangeSerieUserList(serieUserList);
  }
}
