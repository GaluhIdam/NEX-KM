import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PopularInterface } from '../../interfaces/popular-interface';
import {
  faArrowRight,
  faBookBookmark,
  faBookOpen,
  faImage,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import { AlbumDataService } from 'src/app/core/services/nex-library/album-data.service';
import { Subject, takeUntil, tap } from 'rxjs';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import { AlbumDTO } from 'src/app/core/dtos/nex-library/album.dto';
import * as moment from 'moment';
import { ActivatedRoute, Router } from '@angular/router';
import { AlbumCategoryDTO } from 'src/app/core/dtos/nex-library/album-category.dto';
import { LocalService } from 'src/app/core/services/local/local.service';

@Component({
  selector: 'app-detail-album',
  templateUrl: './detail-album.component.html',
  styleUrls: ['./detail-album.component.css'],
})
export class DetailAlbumComponent {
  faArrowRight = faArrowRight;
  faBookOpen = faBookOpen;
  faImage = faImage;
  faSearch = faSearch;
  faBookBookmark = faBookBookmark;

  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  //uuid from URL
  uuid: string | null;

  //Album Category Data
  albumCategoryData: AlbumCategoryDTO[];

  selectedAlbumCategory: AlbumCategoryDTO | undefined;

  albumData: AlbumDTO | undefined;

  isCategoryLoading: boolean;
  isContentLoading: boolean;
  isError: boolean;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly albumDataService: AlbumDataService,
    private readonly localService: LocalService
  ) {
    this.uuid = this.route.snapshot.paramMap.get('uuid');
    this.albumCategoryData = [];
    this.isCategoryLoading = false;
    this.isContentLoading = false;
    this.isError = false;
  }

  ngOnInit(): void {
    this.initAlbumCategoryData();
    this.initAlbumDetailData();
  }
  ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();
  }

  initAlbumCategoryData() {
    const albumCategories = this.localService.getData('album_categories');
    if (albumCategories !== null) {
      this.albumCategoryData = JSON.parse(albumCategories);
      if (this.selectedAlbumCategory === undefined) {
        const selectedCategory = this.localService.getData(
          'selected_album_category'
        );
        if (selectedCategory !== null) {
          this.selectedAlbumCategory = JSON.parse(selectedCategory);
        } else {
          this.router.navigate(['/user/nex-library/album']);
        }
      }
    }
  }

  initAlbumDetailData(): void {
    if (this.uuid) {
      this.isContentLoading = true;
      this.albumDataService
        .getAlbumDetailDataByUuid(this.uuid)
        .pipe(
          tap((response) => {
            response.data.path =
              environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' +
              response.data.path;
            response.data.galleryAlbum.map((gallery) => {
              gallery.path =
                environment.httpUrl +
                '/v1/api/file-manager/get-imagepdf/' +
                gallery.path;
            });
          }),
          takeUntil(this._onDestroy$)
        )
        .subscribe(
          (response) => {
            this.isContentLoading = false;
            this.albumData = response.data;
          },
          () => {
            this.isContentLoading = false;
            this.isError = true;
          }
        );
    }
  }

  formattedDate(date: string): string {
    return moment(date).format('LL');
  }
}
