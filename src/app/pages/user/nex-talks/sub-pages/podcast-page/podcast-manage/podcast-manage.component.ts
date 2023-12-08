import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  faBars,
  faChevronRight,
  faClock,
  faEllipsis,
  faHome,
  faMusic,
  faThumbsUp,
  faVolumeHigh,
} from '@fortawesome/free-solid-svg-icons';
import { PlyrComponent } from 'ngx-plyr';
import { LocalService } from 'src/app/core/services/local/local.service';
import { PodcastManageDTO } from './dto/podcast-manage.dto';
import { PodcastDTO } from 'src/app/core/dtos/nex-talk/podcast.dto';
import { PodcastDataService } from 'src/app/core/services/nex-talk/podcast-data.service';
import { Subject, Subscription, takeUntil, tap } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import { PlayerService } from 'src/app/core/services/nex-talk/player.service';
import { Store } from '@ngrx/store';
import { PodcastStoreModel } from '../../../store/podcast/podcast-store.model';
import { changeCurrentPage } from '../../../store/podcast/podcast.actions';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-podcast-manage',
  templateUrl: './podcast-manage.component.html',
  styleUrls: ['./podcast-manage.component.css'],
})
export class PodcastManageComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  faBars = faBars;
  faHome = faHome;
  faEllipsis = faEllipsis;
  faChevronRight = faChevronRight;
  faMusic = faMusic;
  faVolumeHigh = faVolumeHigh;
  faClock = faClock;
  faThumbsUp = faThumbsUp;

  // get the component instance to have access to plyr instance
  @ViewChild(PlyrComponent)
  plyr!: PlyrComponent;

  // or get it from plyrInit event
  player!: Plyr;

  podcastSubscribe!: Subscription;
  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

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

  selectedCategory: PodcastManageDTO;

  //#region ------------- Podcast Last Release --------------------
  podcastLastReleaseData: PodcastDTO[];
  isPodcastLastReleaseLoading: boolean;
  isPodcastLastReleaseDurationLoading: boolean;
  isPodcastLastReleasePlay: boolean;
  //#endregion ---------- Podcast Last Release --------------------

  //#region ------------- Podcast Recently Play --------------------
  podcastLastPlayData: PodcastDTO[];
  isPodcastLastPlayLoading: boolean;
  isPodcastLastPlayDurationLoading: boolean;
  isPodcastRecentlyPlay: boolean;
  //#endregion ---------- Podcast Recently Play --------------------

  //#region ------------- Podcast Liked --------------------
  podcastLikedData: PodcastDTO[];
  isPodcastLikedLoading: boolean;
  isPodcastLikedDurationLoading: boolean;
  isPodcastLikedPlay: boolean;
  //#endregion ---------- Podcast Liked --------------------

  selectedPodcastToPlay: PodcastDTO | undefined;
  currentIndexPodcastToPlay: number;
  playCount: number;

  isStillPlaying: boolean;

  constructor(
    private readonly router: Router,
    private readonly localService: LocalService,
    private readonly podcastDataService: PodcastDataService,
    private readonly changeDetector: ChangeDetectorRef,
    private readonly playerService: PlayerService,
    private readonly store: Store<{ podcast: PodcastStoreModel }>
  ) {
    const selectedCategory = this.localService.getData(
      'selected_manage_podcast_category'
    );
    if (selectedCategory !== null) {
      this.selectedCategory = JSON.parse(selectedCategory);
    } else {
      this.selectedCategory = this.categoryData[0];
    }
    this.playCount = 0;
    this.currentIndexPodcastToPlay = 0;
    this.podcastLastReleaseData = [];
    this.isPodcastLastReleaseLoading = false;
    this.isPodcastLastReleaseDurationLoading = false;
    this.podcastLastPlayData = [];
    this.isPodcastLastPlayLoading = false;
    this.isPodcastLastPlayDurationLoading = false;
    this.podcastLikedData = [];
    this.isPodcastLikedLoading = false;
    this.isPodcastLikedDurationLoading = false;
    this.isPodcastLastReleasePlay = false;
    this.isPodcastRecentlyPlay = false;
    this.isPodcastLikedPlay = false;
    this.isStillPlaying = false;
  }

  ngOnInit(): void {
    this.initPodcastLastReleaseData();
    this.initPodcastLastPlayData();
    this.initLikedPodcastData();

    this.onChangePodcastPage('manage-podcast-page');
    this.podcastSubscribe = this.store.select('podcast').subscribe((data) => {
      this.isStillPlaying = data.isStillPlaying;
    });
  }

  ngAfterViewInit(): void {
    this.changeDetector.detectChanges();
  }

  ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();
  }

  //#region ------------- State Management ------------------
  onChangePodcastPage(value: string) {
    this.store.dispatch(changeCurrentPage({ page: value }));
  }
  //#endregion ------------- State Management ------------------

  podcastListDetail(): void {
    this.router.navigate(['/user/nex-talks/podcast/podcast-list/detail']);
  }

  onChangeCategory(category: PodcastManageDTO): void {
    this.localService.saveData(
      'selected_manage_podcast_category',
      JSON.stringify(category)
    );
    this.selectedCategory = category;

    this.onChangeCurrentPodcastPlayList(category.name);
  }

  initPodcastLastReleaseData(): void {
    this.isPodcastLastReleaseLoading = true;
    let params: string = `page=${1}&limit=${10}&status=${true}&order_by=desc&approval_status=Approved`;

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
            element.duration = '00:00';

            if (this.selectedPodcastToPlay?.id === element.id) {
              element.isPause = this.selectedPodcastToPlay.isPause;
            } else {
              element.isPause = false;
            }

            this.isPodcastLastReleaseDurationLoading = true;
            this.podcastDataService
              .getPodcastDurationFromUrl(element.pathFile)
              .subscribe(
                (duration) => {
                  this.isPodcastLastReleaseDurationLoading = false;
                  element.duration = this.formatDuration(duration);
                },
                (error) => {
                  this.isPodcastLastReleaseDurationLoading = false;
                }
              );
          });
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe((response) => {
        this.isPodcastLastReleaseLoading = false;
        this.podcastLastReleaseData = response.data.data;
      });
  }

  initPodcastLastPlayData(): void {
    this.isPodcastLastPlayLoading = true;
    let params: string = `page=${1}&limit=${10}&status=${true}&order_by=lastPlayed&approval_status=Approved`;

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

            element.duration = '00:00';

            if (this.selectedPodcastToPlay?.id === element.id) {
              element.isPause = this.selectedPodcastToPlay.isPause;
            } else {
              element.isPause = false;
            }

            this.isPodcastLastPlayDurationLoading = true;
            this.podcastDataService
              .getPodcastDurationFromUrl(element.pathFile)
              .subscribe(
                (duration) => {
                  this.isPodcastLastPlayDurationLoading = false;
                  element.duration = this.formatDuration(duration);
                },
                (error) => {
                  this.isPodcastLastPlayDurationLoading = false;
                }
              );
          });
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe((response) => {
        this.podcastLastPlayData = response.data.data;
        this.isPodcastLastPlayLoading = false;
      });
  }

  initLikedPodcastData(): void {
    this.isPodcastLikedLoading = true;
    let params: string = `page=${1}&limit=${10}&status=${true}&order_by=mostLiked&approval_status=Approved`;

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

            element.duration = '00:00';

            if (this.selectedPodcastToPlay?.id === element.id) {
              element.isPause = this.selectedPodcastToPlay.isPause;
            } else {
              element.isPause = false;
            }

            this.isPodcastLikedDurationLoading = true;
            this.podcastDataService
              .getPodcastDurationFromUrl(element.pathFile)
              .subscribe(
                (duration) => {
                  this.isPodcastLikedDurationLoading = false;
                  element.duration = this.formatDuration(duration);
                },
                (error) => {
                  this.isPodcastLikedDurationLoading = false;
                }
              );
          });
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe((response) => {
        this.isPodcastLikedLoading = false;
        this.podcastLikedData = response.data.data;
      });
  }

  updatePlayedPodcast(): void {
    if (this.selectedPodcastToPlay) {
      this.podcastDataService
        .playPodcast(this.selectedPodcastToPlay.uuid, {})
        .pipe(takeUntil(this._onDestroy$))
        .subscribe(() => {
          if (!this.isPodcastRecentlyPlay) {
            this.initPodcastLastPlayData();
          }
        });
    }
  }

  played(event: Plyr.PlyrEvent) {
    if (this.playCount === 0) {
      this.updatePlayedPodcast();
    }
    this.playCount = 1;

    const updatePodcastList = (podcastList: PodcastDTO[]) => {
      if (this.selectedPodcastToPlay && podcastList.length > 0) {
        const index = podcastList.findIndex(
          (podcast) => podcast.id === this.selectedPodcastToPlay?.id
        );
        if (index !== -1 && !podcastList[index].isPause) {
          podcastList[index].isPause = true;
        }
      }
    };

    updatePodcastList(this.podcastLastReleaseData);
    updatePodcastList(this.podcastLastPlayData);
    updatePodcastList(this.podcastLikedData);
  }

  paused(event: Plyr.PlyrEvent) {
    const updatePodcastList = (podcastList: PodcastDTO[]) => {
      if (this.selectedPodcastToPlay && podcastList.length > 0) {
        const index = podcastList.findIndex(
          (podcast) => podcast.id === this.selectedPodcastToPlay?.id
        );
        if (index !== -1 && podcastList[index].isPause) {
          podcastList[index].isPause = false;
        }
      }
    };

    updatePodcastList(this.podcastLastReleaseData);
    updatePodcastList(this.podcastLastPlayData);
    updatePodcastList(this.podcastLikedData);
  }

  stopped(event: Plyr.PlyrEvent) {
    // Increment the index to play the next podcast
    this.currentIndexPodcastToPlay++;

    // Determine the currently active podcast array
    let activeArray = null;

    if (this.isPodcastLastReleasePlay) {
      activeArray = this.podcastLastReleaseData;
    } else if (this.isPodcastRecentlyPlay) {
      activeArray = this.podcastLastPlayData;
    } else if (this.isPodcastLikedPlay) {
      activeArray = this.podcastLikedData;
    }

    // Check if there are more tracks to play in the active array
    if (activeArray && this.currentIndexPodcastToPlay < activeArray.length) {
      this.selectedPodcastToPlay = activeArray[this.currentIndexPodcastToPlay];
    } else {
      // Revert play count
      this.playCount = 0;
    }
  }

  onChangeCurrentPodcastPlayList(categoryName: string): void {
    if (this.selectedPodcastToPlay) {
      if (categoryName === 'Latest Release' && !this.isPodcastLastReleasePlay) {
        if (this.podcastLastReleaseData.length > 0) {
          const index = this.podcastLastReleaseData.findIndex(
            (podcast) => podcast.id === this.selectedPodcastToPlay?.id
          );

          if (index !== -1) {
            this.currentIndexPodcastToPlay = index;
            this.isPodcastLastReleasePlay = true;
            this.isPodcastRecentlyPlay = false;
            this.isPodcastLikedPlay = false;
          }
        }
      } else if (
        categoryName === 'Recently Played' &&
        !this.isPodcastRecentlyPlay
      ) {
        if (this.podcastLastPlayData.length > 0) {
          const index = this.podcastLastPlayData.findIndex(
            (podcast) => podcast.id === this.selectedPodcastToPlay?.id
          );

          if (index !== -1) {
            this.currentIndexPodcastToPlay = index;
            this.isPodcastLastReleasePlay = false;
            this.isPodcastRecentlyPlay = true;
            this.isPodcastLikedPlay = false;
          }
        }
      } else if (categoryName === 'Liked Podcast' && !this.isPodcastLikedPlay) {
        if (this.podcastLikedData.length > 0) {
          const index = this.podcastLikedData.findIndex(
            (podcast) => podcast.id === this.selectedPodcastToPlay?.id
          );

          if (index !== -1) {
            this.currentIndexPodcastToPlay = index;
            this.isPodcastLastReleasePlay = false;
            this.isPodcastRecentlyPlay = false;
            this.isPodcastLikedPlay = true;
          }
        }
      }
    }
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
