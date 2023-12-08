import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { PlyrComponent } from 'ngx-plyr';
import * as Plyr from 'plyr';
import {
  faChevronRight,
  faEllipsis,
  faPlay,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import { PodcastDTO } from 'src/app/core/dtos/nex-talk/podcast.dto';
import { PodcastDataService } from 'src/app/core/services/nex-talk/podcast-data.service';
import { Observable, Subject, Subscription, takeUntil, tap } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import { LocalService } from 'src/app/core/services/local/local.service';
import { KeycloakService } from 'keycloak-angular';
import { PodcastManageDTO } from './podcast-manage/dto/podcast-manage.dto';
import { SerieDTO } from 'src/app/core/dtos/nex-talk/serie.dto';
import { SerieDataService } from 'src/app/core/services/nex-talk/serie-data.service';
import { faPause } from '@fortawesome/free-solid-svg-icons';
import { Store } from '@ngrx/store';
import { PodcastStoreModel } from '../../store/podcast/podcast-store.model';
import {
  changeCurrentPlayingPodcastList,
  changeIndexPodcastToPlay,
  changeIndexSerieToPlay,
  changePlayCount,
  changePodcastCreatorList,
  changePodcastToPlay,
  changeSerieCreatorList,
  changeSerieDetail,
  changeSerieLastReleaseList,
  changeSerieList,
  changeSerieToPlay,
  changeSerieUserList,
  changeStillPlaying,
  incrementIndexPodcastToPlay,
  resetAllState,
  resetIndexPodcastToPlay,
} from '../../store/podcast/podcast.actions';
import { PlayerService } from 'src/app/core/services/nex-talk/player.service';

@Component({
  selector: 'app-podcast-page',
  templateUrl: './podcast-page.component.html',
  styleUrls: ['./podcast-page.component.css'],
})
export class PodcastPageComponent implements OnInit, OnDestroy {
  faEllipsis = faEllipsis;
  faSearch = faSearch;
  faChevronRight = faChevronRight;
  faPlay = faPlay;
  faPause = faPause;

  podcastSubscribe!: Subscription;
  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  // get the component instance to have access to plyr instance
  @ViewChild(PlyrComponent)
  plyr!: PlyrComponent;

  playCount: number;

  //#region ------------- State Management ------------------
  page: string;
  currentSerieTypePlaying: string;
  currentIndexSerieToPlay: number;
  currentIndexPodcastToPlay: number;
  podcastListData: PodcastDTO[];
  selectedPodcastToPlay: PodcastDTO | undefined;
  serieListData: SerieDTO[];
  serieLastReleaseData: SerieDTO[];
  serieUserData: SerieDTO[];
  selectedSerieToPlay: SerieDTO | undefined;
  serieDetail: SerieDTO | undefined;
  serieCreatorList: SerieDTO[];
  podcastCreatorList: PodcastDTO[];
  //#endregion ---------- State Management ------------------

  constructor(
    private readonly podcastDataService: PodcastDataService,
    private readonly playerService: PlayerService,
    private readonly store: Store<{ podcast: PodcastStoreModel }>
  ) {
    this.page = '';
    this.playCount = 0;
    this.currentIndexPodcastToPlay = 0;
    this.currentIndexSerieToPlay = 0;
    this.currentSerieTypePlaying = '';
    this.podcastListData = [];
    this.serieListData = [];
    this.serieLastReleaseData = [];
    this.serieUserData = [];
    this.serieCreatorList = [];
    this.podcastCreatorList = [];
  }

  ngOnInit(): void {
    this.onResetAllState();
    this.podcastSubscribe = this.store.select('podcast').subscribe((data) => {
      this.page = data.currentPage;
      this.playCount = data.playCount;
      this.currentIndexPodcastToPlay = data.currentIndexPodcastToPlay;
      this.podcastListData = data.currentPlayingPodcastList;
      this.selectedPodcastToPlay = data.selectedPodcastToPlay;
      this.selectedSerieToPlay = data.selectedSerieToPlay;
      this.serieListData = data.serieList;
      this.serieLastReleaseData = data.serieLastReleaseList;
      this.serieUserData = data.serieUserList;
      this.currentSerieTypePlaying = data.currentSerieTypePlaying;
      this.currentIndexSerieToPlay = data.currentIndexSerieToPlay;
      this.serieDetail = data.serieDetail;
      this.serieCreatorList = data.serieCreatorList;
      this.podcastCreatorList = data.podcastCreatorList;
    });
  }

  ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();

    if (this.podcastSubscribe) {
      this.podcastSubscribe.unsubscribe();
    }
  }

  updatePlayedPodcast(): void {
    if (this.selectedPodcastToPlay) {
      this.podcastDataService
        .playPodcast(this.selectedPodcastToPlay.uuid, {})
        .pipe(takeUntil(this._onDestroy$))
        .subscribe();
    }
  }

  initPlay(event: Plyr) {
    this.playerService.setPlayer(event);
  }

  played(event: Plyr.PlyrEvent) {
    if (this.playCount === 0) {
      this.updatePlayedPodcast();
    }

    this.onChangePlayCount(1);

    //PODCAST PAGE
    if (this.page === 'podcast-page') {
      const updatePodcastList = (
        serieList: SerieDTO[],
        podcastList: PodcastDTO[],
        type: string
      ) => {
        if (
          this.selectedPodcastToPlay &&
          podcastList.length > 0 &&
          serieList.length > 0
        ) {
          const index = podcastList.findIndex(
            (podcast) => podcast.id === this.selectedPodcastToPlay?.id
          );
          if (index !== -1) {
            const updatePodcastList = podcastList.map((podcast) => ({
              ...podcast,
            }));
            updatePodcastList[index].isPause = true;

            this.onChangePodcastToPlay(updatePodcastList[index]);
            this.onChangeCurrentPlayingPodcastList(updatePodcastList);

            const serieIndex = serieList.findIndex(
              (serie) => serie.id === podcastList[index].serieId
            );
            if (serieIndex !== -1 && !serieList[serieIndex].isPause) {
              const updateSerieList = serieList.map((serie) => ({
                ...serie,
              }));
              updateSerieList[serieIndex].isPause = true;

              this.onChangeStillPlaying(true);
              this.onChangeSerieToPlay(updateSerieList[serieIndex]);

              if (type === 'list') {
                this.onChangeSerieList(updateSerieList);
              } else if (type === 'last-release') {
                this.onChangeSerieLastReleaseList(updateSerieList);
              } else if (type === 'user') {
                this.onChangeSerieUserList(updateSerieList);
              }
            }
          }
        }
      };

      updatePodcastList(this.serieListData, this.podcastListData, 'list');
      updatePodcastList(
        this.serieLastReleaseData,
        this.podcastListData,
        'last-release'
      );
      updatePodcastList(this.serieUserData, this.podcastListData, 'user');

      //MY PODCAST PAGE
    } else if (this.page === 'my-podcast-page') {
      if (this.selectedPodcastToPlay && this.podcastListData.length > 0) {
        const index = this.podcastListData.findIndex(
          (podcast) => podcast.id === this.selectedPodcastToPlay?.id
        );
        if (index !== -1) {
          if (!this.podcastListData[index].isPause) {
            const updatePodcastList = this.podcastListData.map((podcast) => ({
              ...podcast,
            }));
            updatePodcastList[index].isPause = true;

            const updateSerieList = this.serieUserData.map((serie) => ({
              ...serie,
            }));
            updateSerieList[this.currentIndexSerieToPlay].isPause = true;

            this.onChangeStillPlaying(true);
            this.onChangePodcastToPlay(updatePodcastList[index]);
            this.onChangeCurrentPlayingPodcastList(updatePodcastList);
            this.onChangeSerieToPlay(
              updateSerieList[this.currentIndexSerieToPlay]
            );
            this.onChangeSerieUserList(updateSerieList);
          }
        }
      }
    } else if (this.page === 'my-podcast-detail-page') {
      if (this.selectedPodcastToPlay && this.podcastListData.length > 0) {
        const index = this.podcastListData.findIndex(
          (podcast) => podcast.id === this.selectedPodcastToPlay?.id
        );
        if (index !== -1) {
          if (!this.podcastListData[index].isPause) {
            const updatePodcastList = this.podcastListData.map((podcast) => ({
              ...podcast,
            }));
            updatePodcastList[index].isPause = true;
            this.onChangeStillPlaying(true);
            this.onChangePodcastToPlay(updatePodcastList[index]);
            this.onChangeCurrentPlayingPodcastList(updatePodcastList);

            if (this.serieDetail) {
              const updatedSerieDetail = {
                ...this.serieDetail,
                isPause: true,
              };
              if (this.serieDetail.id === this.selectedSerieToPlay?.id) {
                this.onChangeSerieDetail(updatedSerieDetail);
                this.onChangeSerieToPlay(updatedSerieDetail);
              }
            }
          }
        }
      }
    } else if (this.page === 'manage-podcast-page') {
      if (this.selectedPodcastToPlay && this.podcastListData.length > 0) {
        const index = this.podcastListData.findIndex(
          (podcast) => podcast.id === this.selectedPodcastToPlay?.id
        );
        if (index !== -1) {
          if (!this.podcastListData[index].isPause) {
            const updatePodcastList = this.podcastListData.map((podcast) => ({
              ...podcast,
            }));
            updatePodcastList[index].isPause = true;

            const updateSerieList = this.serieListData.map((serie) => ({
              ...serie,
            }));
            updateSerieList[this.currentIndexSerieToPlay].isPause = true;

            this.onChangeStillPlaying(true);
            this.onChangePodcastToPlay(updatePodcastList[index]);
            this.onChangeCurrentPlayingPodcastList(updatePodcastList);
            this.onChangeSerieToPlay(
              updateSerieList[this.currentIndexSerieToPlay]
            );
            this.onChangeSerieList(updateSerieList);
          }
        }
      }
    } else if (this.page === 'podcast-detail-page') {
      if (this.selectedPodcastToPlay && this.podcastListData.length > 0) {
        const index = this.podcastListData.findIndex(
          (podcast) => podcast.id === this.selectedPodcastToPlay?.id
        );
        if (index !== -1) {
          if (!this.podcastListData[index].isPause) {
            const updatePodcastList = this.podcastListData.map((podcast) => ({
              ...podcast,
            }));
            updatePodcastList[index].isPause = true;
            this.onChangeStillPlaying(true);
            this.onChangePodcastToPlay(updatePodcastList[index]);
            this.onChangeCurrentPlayingPodcastList(updatePodcastList);

            if (this.serieDetail) {
              const updatedSerieDetail = {
                ...this.serieDetail,
                isPause: true,
              };
              if (this.serieDetail.id === this.selectedSerieToPlay?.id) {
                this.onChangeSerieDetail(updatedSerieDetail);
                this.onChangeSerieToPlay(updatedSerieDetail);
              }
            }
          }
        }
      }
    } else if (this.page === 'podcast-creator-detail-page') {
      if (this.selectedPodcastToPlay && this.podcastListData.length > 0) {
        const index = this.podcastListData.findIndex(
          (podcast) => podcast.id === this.selectedPodcastToPlay?.id
        );
        if (index !== -1 && !this.podcastListData[index].isPause) {
          const updateSerieList = this.serieCreatorList.map((serie) => ({
            ...serie,
          }));
          updateSerieList[this.currentIndexSerieToPlay].isPause = true;
          this.onChangeSerieCreatorList(updateSerieList);
          this.onChangeSerieToPlay(
            updateSerieList[this.currentIndexSerieToPlay]
          );
          this.onChangeStillPlaying(true);
          if (
            index < this.podcastCreatorList.length &&
            this.podcastListData[index].id === this.podcastCreatorList[index].id
          ) {
            const updatePodcastList = this.podcastCreatorList.map(
              (podcast) => ({
                ...podcast,
              })
            );
            updatePodcastList[index].isPause = true;
            this.onChangePodcastCreatorList(updatePodcastList);
          }
          const updatePodcastList = this.podcastListData.map((podcast) => ({
            ...podcast,
          }));
          updatePodcastList[index].isPause = true;
          this.onChangeCurrentPlayingPodcastList(updatePodcastList);
          this.onChangePodcastToPlay(updatePodcastList[index]);
        }
      }
    }
  }

  paused(event: Plyr.PlyrEvent) {
    //PODCAST PAGE
    if (this.page === 'podcast-page') {
      const updatePodcastList = (
        serieList: SerieDTO[],
        podcastList: PodcastDTO[],
        type: string
      ) => {
        if (
          this.selectedPodcastToPlay &&
          podcastList.length > 0 &&
          serieList.length > 0
        ) {
          const index = podcastList.findIndex(
            (podcast) => podcast.id === this.selectedPodcastToPlay?.id
          );
          if (index !== -1) {
            const updatePodcastList = podcastList.map((podcast) => ({
              ...podcast,
            }));
            updatePodcastList[index].isPause = false;

            this.onChangePodcastToPlay(updatePodcastList[index]);
            this.onChangeCurrentPlayingPodcastList(updatePodcastList);

            const serieIndex = serieList.findIndex(
              (serie) => serie.id === podcastList[index].serieId
            );

            if (serieIndex !== -1 && serieList[serieIndex].isPause) {
              const updateSerieList = serieList.map((serie) => ({
                ...serie,
              }));
              updateSerieList[serieIndex].isPause = false;
              this.onChangeStillPlaying(false);
              this.onChangeSerieToPlay(updateSerieList[serieIndex]);

              if (type === 'list') {
                this.onChangeSerieList(updateSerieList);
              } else if (type === 'last-release') {
                this.onChangeSerieLastReleaseList(updateSerieList);
              } else if (type === 'user') {
                this.onChangeSerieUserList(updateSerieList);
              }
            }
          }
        }
      };

      updatePodcastList(this.serieListData, this.podcastListData, 'list');
      updatePodcastList(
        this.serieLastReleaseData,
        this.podcastListData,
        'last-release'
      );
      updatePodcastList(this.serieUserData, this.podcastListData, 'user');

      //MY PODCAST PAGE
    } else if (this.page === 'my-podcast-page') {
      if (this.selectedPodcastToPlay && this.podcastListData.length > 0) {
        const index = this.podcastListData.findIndex(
          (podcast) => podcast.id === this.selectedPodcastToPlay?.id
        );
        if (index !== -1) {
          if (this.podcastListData[index].isPause) {
            const updatePodcastList = this.podcastListData.map((podcast) => ({
              ...podcast,
            }));
            updatePodcastList[index].isPause = false;

            const updateSerieList = this.serieUserData.map((serie) => ({
              ...serie,
            }));
            updateSerieList[this.currentIndexSerieToPlay].isPause = false;

            this.onChangeStillPlaying(false);
            this.onChangePodcastToPlay(updatePodcastList[index]);
            this.onChangeCurrentPlayingPodcastList(updatePodcastList);
            this.onChangeSerieToPlay(
              updateSerieList[this.currentIndexSerieToPlay]
            );
            this.onChangeSerieUserList(updateSerieList);
          }
        }
      }
    } else if (this.page === 'my-podcast-detail-page') {
      if (this.selectedPodcastToPlay && this.podcastListData.length > 0) {
        const index = this.podcastListData.findIndex(
          (podcast) => podcast.id === this.selectedPodcastToPlay?.id
        );
        if (index !== -1) {
          if (this.podcastListData[index].isPause) {
            const updatePodcastList = this.podcastListData.map((podcast) => ({
              ...podcast,
            }));
            updatePodcastList[index].isPause = false;
            this.onChangeStillPlaying(false);
            this.onChangePodcastToPlay(updatePodcastList[index]);
            this.onChangeCurrentPlayingPodcastList(updatePodcastList);

            if (this.serieDetail) {
              const updatedSerieDetail = {
                ...this.serieDetail,
                isPause: false,
              };
              if (this.serieDetail.id === this.selectedSerieToPlay?.id) {
                this.onChangeSerieDetail(updatedSerieDetail);
                this.onChangeSerieToPlay(updatedSerieDetail);
              }
            }
          }
        }
      }
    } else if (this.page === 'manage-podcast-page') {
      if (this.selectedPodcastToPlay && this.podcastListData.length > 0) {
        const index = this.podcastListData.findIndex(
          (podcast) => podcast.id === this.selectedPodcastToPlay?.id
        );
        if (index !== -1) {
          if (this.podcastListData[index].isPause) {
            const updatePodcastList = this.podcastListData.map((podcast) => ({
              ...podcast,
            }));
            updatePodcastList[index].isPause = false;

            const updateSerieList = this.serieListData.map((serie) => ({
              ...serie,
            }));
            console.log(this.currentIndexSerieToPlay, 'pause', index);
            updateSerieList[this.currentIndexSerieToPlay].isPause = false;

            this.onChangeStillPlaying(false);
            this.onChangePodcastToPlay(updatePodcastList[index]);
            this.onChangeCurrentPlayingPodcastList(updatePodcastList);
            this.onChangeSerieToPlay(
              updateSerieList[this.currentIndexSerieToPlay]
            );
            this.onChangeSerieList(updateSerieList);
          }
        }
      }
    } else if (this.page === 'podcast-detail-page') {
      if (this.selectedPodcastToPlay && this.podcastListData.length > 0) {
        const index = this.podcastListData.findIndex(
          (podcast) => podcast.id === this.selectedPodcastToPlay?.id
        );
        if (index !== -1) {
          if (this.podcastListData[index].isPause) {
            const updatePodcastList = this.podcastListData.map((podcast) => ({
              ...podcast,
            }));
            updatePodcastList[index].isPause = false;
            this.onChangeStillPlaying(false);
            this.onChangePodcastToPlay(updatePodcastList[index]);
            this.onChangeCurrentPlayingPodcastList(updatePodcastList);

            if (this.serieDetail) {
              const updatedSerieDetail = {
                ...this.serieDetail,
                isPause: false,
              };
              if (this.serieDetail.id === this.selectedSerieToPlay?.id) {
                this.onChangeSerieDetail(updatedSerieDetail);
                this.onChangeSerieToPlay(updatedSerieDetail);
              }
            }
          }
        }
      }
    } else if (this.page === 'podcast-creator-detail-page') {
      if (this.selectedPodcastToPlay && this.podcastListData.length > 0) {
        const index = this.podcastListData.findIndex(
          (podcast) => podcast.id === this.selectedPodcastToPlay?.id
        );
        if (index !== -1 && this.podcastListData[index].isPause) {
          const updateSerieList = this.serieCreatorList.map((serie) => ({
            ...serie,
          }));
          updateSerieList[this.currentIndexSerieToPlay].isPause = false;
          this.onChangeSerieCreatorList(updateSerieList);
          this.onChangeSerieToPlay(
            updateSerieList[this.currentIndexSerieToPlay]
          );
          this.onChangeStillPlaying(false);
          if (
            index < this.podcastCreatorList.length &&
            this.podcastListData[index].id === this.podcastCreatorList[index].id
          ) {
            const updatePodcastList = this.podcastCreatorList.map(
              (podcast) => ({
                ...podcast,
              })
            );
            updatePodcastList[index].isPause = false;
            this.onChangePodcastCreatorList(updatePodcastList);
          }
          const updatePodcastList = this.podcastListData.map((podcast) => ({
            ...podcast,
          }));
          updatePodcastList[index].isPause = false;
          this.onChangeCurrentPlayingPodcastList(updatePodcastList);
          this.onChangePodcastToPlay(updatePodcastList[index]);
        }
      }
    }
  }

  stopped(event: Plyr.PlyrEvent) {
    // Increment the index to play the next podcast
    this.onIncrementIndexPodcastToPlay();

    // If there are more tracks in the playlist, play the next podcast
    if (this.currentIndexPodcastToPlay < this.podcastListData.length) {
      this.onChangePodcastToPlay(
        this.podcastListData[this.currentIndexPodcastToPlay]
      );
    } else {
      //PODCAST PAGE
      if (this.page === 'podcast-page') {
        if (this.currentSerieTypePlaying === 'list') {
          const updateSerieList = this.serieListData.map((serie) => ({
            ...serie,
          }));
          updateSerieList[this.currentIndexSerieToPlay].isPause = false;
          this.onChangeSerieList(updateSerieList);
        } else if (this.currentSerieTypePlaying === 'last-release') {
          const updateSerieLastReleaseList = this.serieLastReleaseData.map(
            (serie) => ({
              ...serie,
            })
          );
          updateSerieLastReleaseList[this.currentIndexSerieToPlay].isPause =
            false;
          this.onChangeSerieLastReleaseList(updateSerieLastReleaseList);
        } else if (this.currentSerieTypePlaying === 'user') {
          const updateSerieUserList = this.serieUserData.map((serie) => ({
            ...serie,
          }));
          updateSerieUserList[this.currentIndexSerieToPlay].isPause = false;
          this.onChangeSerieUserList(updateSerieUserList);
        }

        //MY PODCAST PAGE
      } else if (this.page === 'my-podcast-page') {
        const updateSerieUserList = this.serieUserData.map((serie) => ({
          ...serie,
        }));
        updateSerieUserList[this.currentIndexSerieToPlay].isPause = false;
        this.onChangeSerieUserList(updateSerieUserList);
      } else if (this.page === 'my-podcast-detail-page') {
        if (this.serieDetail) {
          const updatedSerieDetail = {
            ...this.serieDetail,
            isPause: false,
          };

          if (this.serieDetail.id === this.selectedSerieToPlay?.id) {
            this.onChangeSerieDetail(updatedSerieDetail);
            this.onChangeSerieToPlay(updatedSerieDetail);
          }
        }
      } else if (this.page === 'manage-podcast-page') {
        const updateSerieList = this.serieListData.map((serie) => ({
          ...serie,
        }));
        updateSerieList[this.currentIndexSerieToPlay].isPause = false;
        this.onChangeSerieList(updateSerieList);
      } else if (this.page === 'podcast-detail-page') {
        if (this.serieDetail) {
          const updatedSerieDetail = {
            ...this.serieDetail,
            isPause: false,
          };

          if (this.serieDetail.id === this.selectedSerieToPlay?.id) {
            this.onChangeSerieDetail(updatedSerieDetail);
            this.onChangeSerieToPlay(updatedSerieDetail);
          }
        }
      } else if (this.page === 'podcast-creator-detail-page') {
        const updateSerieList = this.serieCreatorList.map((serie) => ({
          ...serie,
        }));
        updateSerieList[this.currentIndexSerieToPlay].isPause = false;
        this.onChangeSerieCreatorList(updateSerieList);
      }
      // revert count play
      this.onResetIndexPodcastToPlay();
      this.onChangeStillPlaying(false);
      this.onChangePlayCount(0);
    }
  }

  //#region ------------- State Management ------------------
  onResetAllState() {
    this.store.dispatch(resetAllState());
  }

  onChangeStillPlaying(value: boolean) {
    this.store.dispatch(changeStillPlaying({ status: value }));
  }

  onChangePlayCount(value: number) {
    this.store.dispatch(changePlayCount({ count: value }));
  }

  onIncrementIndexPodcastToPlay() {
    this.store.dispatch(incrementIndexPodcastToPlay());
  }

  onResetIndexPodcastToPlay() {
    this.store.dispatch(resetIndexPodcastToPlay());
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

  onChangeSerieDetail(serie: SerieDTO) {
    this.store.dispatch(changeSerieDetail({ serie: serie }));
  }

  onChangeSerieCreatorList(serieList: SerieDTO[]) {
    this.store.dispatch(changeSerieCreatorList({ serieList: serieList }));
  }

  onChangePodcastCreatorList(podcastList: PodcastDTO[]) {
    this.store.dispatch(changePodcastCreatorList({ podcastList: podcastList }));
  }

  onChangeIndexSerieToPlay(index: number) {
    this.store.dispatch(changeIndexSerieToPlay({ index: index }));
  }
  //#endregion ------------- State Management ------------------
}
