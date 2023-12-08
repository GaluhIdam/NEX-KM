import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { PlyrComponent } from 'ngx-plyr';
import * as Plyr from 'plyr';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { StreamDTO } from 'src/app/core/dtos/nex-talk/stream.dto';
import { LocalService } from 'src/app/core/services/local/local.service';
import { StreamDataService } from 'src/app/core/services/nex-talk/stream-data.service';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-stream-streaming',
  templateUrl: './stream-streaming.component.html',
  styleUrls: ['./stream-streaming.component.css'],
})
export class StreamStreamingComponent implements OnDestroy, OnInit {
  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  //#region ------------- Stream Detail --------------------
  //uuid from URL
  uuid: string | null;
  streamDetailData: StreamDTO | undefined;
  userWatchPersonalNumber: string | undefined;
  isDetailStreamLoading: boolean;
  isDetailStreamError: boolean;
  photoDetailStreamUploader: string;
  playCountStream: number;
  //#endregion ---------- Stream Detail --------------------

  //#region ------------- Streams --------------------
  streamData: StreamDTO[];
  photoStreamUploaders: string[];
  isStreamLoading: boolean;
  //#endregion ---------- Streams --------------------

  constructor(
    private readonly router: Router,
    private readonly localService: LocalService,
    private readonly keycloakService: KeycloakService,
    private readonly route: ActivatedRoute,
    private readonly streamDataService: StreamDataService
  ) {
    this.uuid = this.route.snapshot.paramMap.get('uuid');
    this.photoDetailStreamUploader = '';
    this.isDetailStreamLoading = false;
    this.isDetailStreamError = false;
    this.streamData = [];
    this.photoStreamUploaders = [];
    this.isStreamLoading = false;
    this.playCountStream = 0;
  }

  ngOnInit(): void {
    this.initializeUserWatching();
    this.initStreamDetailData(true);
  }

  ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();
  }

  // get the component instance to have access to plyr instance
  @ViewChild(PlyrComponent, { static: true })
  plyr!: PlyrComponent;

  // or get it from plyrInit event
  player!: Plyr;

  played(event: Plyr.PlyrEvent) {
    console.log('played', event);
    if (this.playCountStream === 0) {
      this.addWatchStream();
    }
    // count stream play already
    this.playCountStream = 1;
  }

  stopped(event: Plyr.PlyrEvent) {
    console.log('stopped', event);
    // revert count play stream
    this.playCountStream = 0;
  }

  play(): void {
    this.player.play(); // or this.plyr.player.play()
  }

  pause(): void {
    this.player.pause(); // or this.plyr.player.play()
  }

  stop(): void {
    this.player.stop(); // or this.plyr.player.stop()
  }

  //GET Personal Number from Keycloak
  private initializeUserWatching(): void {
    this.userWatchPersonalNumber = this.keycloakService.getUsername();
  }

  initStreamDetailData(refresh?: boolean): void {
    if (this.uuid) {
      if (refresh !== undefined && refresh === true) {
        this.isDetailStreamLoading = true;
        this.isDetailStreamError = false;
      }
      this.streamDataService
        .getStreamDetailDataByUuid(this.uuid)
        .pipe(
          tap((response) => {
            this.checkphoto(response.data.personalNumber).subscribe();
            response.data.pathVideo =
              environment.httpUrl +
              '/v1/api/file-manager/get-m3u8/' +
              response.data.pathVideo.replace('/transcodeMP4.m3u8', '');
            response.data.pathThumbnail =
              environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' +
              response.data.pathThumbnail;
          }),
          takeUntil(this._onDestroy$)
        )
        .subscribe(
          (response) => {
            if (refresh !== undefined && refresh === true) {
              this.isDetailStreamLoading = false;
            }
            this.streamDetailData = response.data;
            this.initStreamData(refresh);
          },
          () => {
            if (refresh !== undefined && refresh === true) {
              this.isDetailStreamLoading = false;
              this.isDetailStreamError = true;
            }
          }
        );
    }
  }

  initStreamData(refresh?: boolean): void {
    if (refresh !== undefined && refresh === true) {
      this.isStreamLoading = true;
    }
    let params: string = `page=${1}&limit=${4}&orderBy=trending&approval_status=Approved&status=${true}`;

    this.streamDataService
      .getStreamData(params)
      .pipe(
        tap((response) => {
          this.photoStreamUploaders = new Array(response.data.data.length);
          response.data.data.map((element, index) => {
            this.checkphoto(element.personalNumber, index).subscribe();
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
        if (refresh) {
          this.isStreamLoading = false;
        }
      });
  }

  addWatchStream(): void {
    if (this.streamDetailData && this.userWatchPersonalNumber) {
      const request = {
        streamId: this.streamDetailData.id,
        personalNumber: this.userWatchPersonalNumber,
      };

      this.streamDataService
        .addWatchStream(request)
        .pipe(takeUntil(this._onDestroy$))
        .subscribe(() => {
          this.initStreamDetailData();
          this.initStreamData();
        });
    }
  }

  //Check Photo
  private checkphoto(
    personal_number: string,
    index?: number
  ): Observable<void> {
    const imageUrl = `https://talentlead.gmf-aeroasia.co.id/images/avatar/${personal_number}.jpg`;

    return new Observable<void>((observer) => {
      const img = new Image();
      img.onload = () => {
        if (index !== undefined) {
          this.photoStreamUploaders[index] = imageUrl;
        } else {
          this.photoDetailStreamUploader = imageUrl;
        }
        observer.next();
        observer.complete();
      };
      img.onerror = () => {
        const defaultImageUrl =
          'https://st3.depositphotos.com/1767687/16607/v/450/depositphotos_166074422-stock-illustration-default-avatar-profile-icon-grey.jpg';
        if (index !== undefined) {
          this.photoStreamUploaders[index] = defaultImageUrl;
        } else {
          this.photoDetailStreamUploader = defaultImageUrl;
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

  streamStreamingPage(uuid: string): void {
    this.router
      .navigate(['/user/nex-talks/stream/streaming/' + uuid])
      .then(() => {
        window.location.reload();
      });
  }

  streamPageList(streamCategory: string): void {
    this.localService.saveData('stream_category', streamCategory);
    this.router.navigate(['/user/nex-talks/stream/list']);
  }
}
