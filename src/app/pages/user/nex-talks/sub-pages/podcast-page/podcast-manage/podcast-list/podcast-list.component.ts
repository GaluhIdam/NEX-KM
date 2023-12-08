import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import { Subject, Subscription, takeUntil, tap } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import { SerieDataService } from 'src/app/core/services/nex-talk/serie-data.service';
import { SerieDTO } from 'src/app/core/dtos/nex-talk/serie.dto';
import { KeycloakService } from 'keycloak-angular';
import { PlayerService } from 'src/app/core/services/nex-talk/player.service';
import { PodcastStoreModel } from '../../../../store/podcast/podcast-store.model';
import { Store } from '@ngrx/store';
import { PodcastDTO } from 'src/app/core/dtos/nex-talk/podcast.dto';
import {
  changeCurrentPage,
  changeCurrentPlayingPodcastList,
  changeIndexPodcastToPlay,
  changeIndexSerieToPlay,
  changePlayCount,
  changePodcastToPlay,
  changeSerieList,
  changeSerieToPlay,
  changeSerieUserList,
  changeStillPlaying,
} from '../../../../store/podcast/podcast.actions';
import { PodcastDataService } from 'src/app/core/services/nex-talk/podcast-data.service';

@Component({
  selector: 'app-podcast-list',
  templateUrl: './podcast-list.component.html',
  styleUrls: ['./podcast-list.component.css'],
})
export class PodcastListComponent implements OnInit, OnDestroy {
  faPlay = faPlay;
  faPause = faPause;

  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();
  podcastSubscribe!: Subscription;

  //#region ------------- Podcast List -------------------
  isLoading: boolean;
  isPodcastListLoading: boolean;
  //#endregion ---------- Podcast List -------------------

  userPersonalNumber: string;

  //#region ------------- State Management ------------------
  playCount: number;
  podcastSerieListData: SerieDTO[];
  podcastListData: PodcastDTO[];
  currentIndexPodcastToPlay: number;
  selectedPodcastToPlay: PodcastDTO | undefined;
  selectedSerieToPlay: SerieDTO | undefined;
  isStillPlaying: boolean;
  //#endregion ---------- State Management ------------------

  constructor(
    private readonly router: Router,
    private readonly serieDataService: SerieDataService,
    private readonly keycloakService: KeycloakService,
    private readonly podcastDataService: PodcastDataService,
    private readonly playerService: PlayerService,
    private readonly store: Store<{ podcast: PodcastStoreModel }>
  ) {
    this.podcastSerieListData = [];
    this.playCount = 0;
    this.podcastListData = [];
    this.isLoading = false;
    this.userPersonalNumber = '';
    this.currentIndexPodcastToPlay = 0;
    this.isStillPlaying = false;
    this.isPodcastListLoading = false;
  }

  ngOnInit(): void {
    this.initializeUser();
    this.initPodcastSerieListData();

    this.podcastSubscribe = this.store.select('podcast').subscribe((data) => {
      this.currentIndexPodcastToPlay = data.currentIndexPodcastToPlay;
      this.podcastListData = data.currentPlayingPodcastList;
      this.selectedPodcastToPlay = data.selectedPodcastToPlay;
      this.selectedSerieToPlay = data.selectedSerieToPlay;
      this.isStillPlaying = data.isStillPlaying;
      this.podcastSerieListData = data.serieList;
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

  onChangeSerieList(serieList: SerieDTO[]) {
    this.store.dispatch(changeSerieList({ serieList: serieList }));
  }
  //#endregion ------------- State Management ------------------

  //GET Personal Number from Keycloak
  private initializeUser(): void {
    this.userPersonalNumber = this.keycloakService.getUsername();
  }

  initPodcastSerieListData(): void {
    this.isLoading = true;
    let params: string = `page=${1}&limit=${20}&status=${true}&approval_status=Approved`;

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
          this.isLoading = false;
          this.onChangeSerieList(response.data.data);
        },
        (error) => {
          this.isLoading = false;
        }
      );
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
    }&status=${true}&serie_id=${serie.id}&approval_status=Approved`;

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
    if (this.podcastSerieListData[indexSerie].isPause) {
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

        const updateSerieList = this.podcastSerieListData.map(
          (serie, index) => ({
            ...serie,
            isPause: index === indexSerie ? true : false,
          })
        );

        this.onChangeSerieList(updateSerieList);
      } else {
        if (this.playerService.getPlayer()) {
          this.playerService.playPlayer();
        }
      }
    }
  }

  private clearPauseFlags() {
    const serieList = this.podcastSerieListData.map((serie) => ({
      ...serie,
      isPause: false,
    }));
    this.onChangeSerieList(serieList);
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
}
