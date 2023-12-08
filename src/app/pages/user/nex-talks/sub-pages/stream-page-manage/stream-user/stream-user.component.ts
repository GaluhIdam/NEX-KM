import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  faBars,
  faBookOpen,
  faFilm,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import { KeycloakService } from 'keycloak-angular';
import { Subject, takeUntil, tap } from 'rxjs';
import { StreamDTO } from 'src/app/core/dtos/nex-talk/stream.dto';
import { PaginatorRequest } from 'src/app/core/requests/paginator.request';
import { ParamsRequest } from 'src/app/core/requests/params.request';
import { StreamDataService } from 'src/app/core/services/nex-talk/stream-data.service';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-stream-user',
  templateUrl: './stream-user.component.html',
  styleUrls: ['./stream-user.component.css'],
})
export class StreamUserComponent implements OnInit, OnDestroy {
  faSearch = faSearch;
  faBookOpen = faBookOpen;
  faFilm = faFilm;
  faBars = faBars;

  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  paginator?: PaginatorRequest;
  dataRequest?: ParamsRequest;
  pages: number[];

  searchValue: String;

  streamData: StreamDTO[];
  userPersonalNumber: string;
  isLoading: boolean;

  constructor(
    private readonly router: Router,
    private readonly keycloakService: KeycloakService,
    private readonly streamDataService: StreamDataService
  ) {
    this.pages = [];
    this.searchValue = '';
    this.streamData = [];
    this.isLoading = false;
    this.userPersonalNumber = '';
  }

  ngOnInit(): void {
    this.initializeUser();
    this.initPaginator();
    this.initParams();
    this.initStreamData();
  }

  ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();
  }

  //GET Personal Number from Keycloak
  private initializeUser(): void {
    this.userPersonalNumber = this.keycloakService.getUsername();
  }

  streamStreaming(uuid: string): void {
    this.router.navigate(['/user/nex-talks/stream/streaming/' + uuid]);
  }

  goToEditStreaming(uuid: string): void {
    this.router.navigate(['/user/nex-talks/stream/edit/' + uuid]);
  }

  initPaginator(): void {
    this.paginator = {
      pageOption: [10, 20, 50, 100],
      pageNumber: 1,
      pageSize: 10,
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

  initStreamData(): void {
    this.isLoading = true;
    let params: string = `page=${this.dataRequest?.page ?? 1}&limit=${
      this.dataRequest?.limit
    }&personalNumber=${this.userPersonalNumber}`;

    if (this.searchValue) {
      params += `&search=${this.searchValue}`;
    }

    this.streamDataService
      .getStreamData(params)
      .pipe(
        tap((response) => {
          response.data.data.map((element) => {
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
        this.isLoading = false;
        this.streamData = response.data.data;
        if (this.paginator) {
          this.paginator.totalData = response.data.totalItems;
          this.paginator.totalPage = response.data.totalPages;
          this.pages = new Array(this.paginator.totalPage);
        }
      });
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

  searchByField(event: any): void {
    this.searchValue = event.target.value;
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
        this.paginator.pageSize = 10;
      }

      if (this.dataRequest) {
        this.dataRequest.limit = this.paginator.pageSize;
        this.dataRequest.page = this.paginator.pageNumber;
        this.dataRequest.offset =
          (this.paginator.pageNumber - 1) * this.paginator.pageSize;
      }

      this.initStreamData();
    }
  }

  onChangeStreamStatus(status: boolean, uuid: string): void {
    this.isLoading = true;
    const request = {
      status: status,
    };

    this.streamDataService.updateStreamStatus(uuid, request).subscribe(
      (success) => {
        Swal.fire({
          icon: 'success',
          title: 'Great Move..',
          text: status
            ? 'The Stream you selected has been activated'
            : 'The Stream you selected has been deactivated',
        }).then(() => {
          this.rePaginate();
        });
      },
      (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: error.error.message,
        }).then(() => {
          this.rePaginate();
        });
      }
    );
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
