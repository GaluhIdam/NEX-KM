import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  faArrowRight,
  faBan,
  faBell,
  faCircleCheck,
  faEye,
  faFilter,
  faGear,
  faPencil,
  faPlus,
  faPrint,
  faRefresh,
  faSearch,
  faStar,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { Subject, takeUntil } from 'rxjs';
import { PaginatorRequest } from 'src/app/core/requests/paginator.request';
import { AlbumCategoryDTO } from 'src/app/core/dtos/nex-library/album-category.dto';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlbumCategoryDataService } from 'src/app/core/services/nex-library/album-category-data.service';
import Swal from 'sweetalert2';
import { ParamsRequest } from 'src/app/core/requests/params.request';
import { KeycloakService } from 'keycloak-angular';
import { SocketService } from 'src/app/core/utility/socket-io-services/socket.io.service';
import { HomePageService } from 'src/app/pages/user/home-page/homepage.service';
import { NotificationRequestDTO } from 'src/app/pages/user/home-page/dtos/notification.dto';

@Component({
  selector: 'app-photo-gallery-category',
  templateUrl: './photo-gallery-category.component.html',
  styleUrls: ['./photo-gallery-category.component.css'],
})
export class PhotoGalleryCategoryComponent implements OnInit, OnDestroy {
  faArrowRight = faArrowRight;
  faBell = faBell;
  faGear = faGear;
  faSearch = faSearch;
  faFilter = faFilter;
  faPrint = faPrint;
  faCircleCheck = faCircleCheck;
  faEye = faEye;
  faStar = faStar;
  faBan = faBan;
  faXmark = faXmark;
  faPencil = faPencil;
  faPlus = faPlus;
  faRefresh = faRefresh;

  @Input() personalNumber = '';

  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  paginator?: PaginatorRequest;
  dataRequest?: ParamsRequest;

  // album category data
  albumCategoryData: AlbumCategoryDTO[];

  selectedAlbumCategory: AlbumCategoryDTO | undefined;

  //default params
  searchValue: String;
  sortBy: string;
  sortStatus: number;

  pages: any;

  isLoading: boolean;

  albumCategoryForm!: FormGroup;

  editMode: boolean;

  showTooltips: boolean[];

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly albumCategoryDataService: AlbumCategoryDataService,
    private readonly keycloackService: KeycloakService,
    private readonly webSocket: SocketService,
    private readonly homepageService: HomePageService
  ) {
    // default value
    this.albumCategoryData = [];
    this.searchValue = '';
    this.sortBy = 'asc';
    this.sortStatus = 0;
    this.isLoading = true;
    this.editMode = false;
    this.showTooltips = [];
  }

  ngOnInit(): void {
    this.initPaginator();
    this.initParams();
    this.createAlbumCategoryForm();

    this.initAlbumCategoryData();
  }
  ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();
  }

  initAlbumCategoryData(): void {
    this.isLoading = true;
    let params: string = `page=${this.dataRequest?.page ?? 1}&limit=${
      this.dataRequest?.limit
    }&search=${this.searchValue}&sortBy=${this.sortBy}`;
    this.albumCategoryDataService
      .getAlbumCategoryData(params)
      .pipe(takeUntil(this._onDestroy$))
      .subscribe((response) => {
        this.showTooltips = new Array(response.data.data.length).fill(false);
        this.albumCategoryData = response.data.data;
        this.isLoading = false;
        if (this.paginator) {
          this.paginator.totalData = response.data.data.length;
          this.paginator.totalData = response.data.totalItems;
          this.paginator.totalPage = response.data.totalPages;
          this.pages = new Array(this.paginator.totalPage);
        }
      });
  }

  searchByField(event: any): void {
    this.searchValue = event.target.value;
    this.initAlbumCategoryData();
  }

  initPaginator(): void {
    this.paginator = {
      pageOption: [10, 25, 50, 100],
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

  goToPageNumberByPageSelect(event: any): void {
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

      this.initAlbumCategoryData();
    }
  }

  createAlbumCategoryForm(): void {
    this.albumCategoryForm = this.formBuilder.group({
      name: ['', Validators.required],
      personalNumber: [this.personalNumber, Validators.required],
    });
  }

  openEditorModal(selectedCategory: AlbumCategoryDTO) {
    this.selectedAlbumCategory = selectedCategory;
    this.setDefaultValue(selectedCategory);
  }

  get name() {
    return this.albumCategoryForm.get('name');
  }

  setDefaultValue(data: AlbumCategoryDTO) {
    this.albumCategoryForm.patchValue({
      name: data.name,
    });
  }

  onSubmit() {
    if (!this.albumCategoryForm.valid) {
      return;
    }

    if (this.editMode) {
      //state for edit Category
      if (this.selectedAlbumCategory) {
        this.onUpdateCategory(
          this.selectedAlbumCategory.uuid,
          this.albumCategoryForm
        );
      }
    } else {
      //state for add new Category
      this.onStoreCategory(this.albumCategoryForm);
    }
  }

  onStoreCategory(form: FormGroup): void {
    this.albumCategoryDataService.storeAlbumCategoryData(form.value).subscribe(
      (success) => {
        Swal.fire({
          icon: 'success',
          title: 'Great Move..',
          text: 'The Album Category you inputed has been added',
        }).then(() => {
          this.onClearForm();
        });
      },
      (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: error.error.message,
        }).then(() => {
          this.onClearForm();
        });
      }
    );
  }

  onUpdateCategory(uuid: string, form: FormGroup): void {
    this.albumCategoryDataService
      .updateAlbumCategoryData(uuid, form.value)
      .subscribe(
        (success) => {
          Swal.fire({
            icon: 'success',
            title: 'Great Move..',
            text: 'The Album Category you selected has been added',
          }).then(() => {
            this.onClearForm();
          });
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: error.error.message,
          }).then(() => {
            this.onClearForm();
          });
        }
      );
  }

  onClearForm(): void {
    this.rePaginate();
    this.createAlbumCategoryForm();
  }

  onSelectAlbumCategory(data: AlbumCategoryDTO): void {
    this.selectedAlbumCategory = data;
  }

  changeAlbumCategoryStatus(status: boolean): void {
    if (this.selectedAlbumCategory) {
      const request = {
        isActive: status,
      };

      this.albumCategoryDataService
        .updateAlbumCategoryStatus(this.selectedAlbumCategory.uuid, request)
        .subscribe(
          (success) => {
            Swal.fire({
              icon: 'success',
              title: 'Great Move..',
              text: status
                ? 'The Album category you selected has been activated'
                : 'The Album category you selected has been deactivated',
            }).then(() => {
              this.onClearForm();
            });
          },
          (error) => {
            this.onClearForm();
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: error.error.message,
            }).then(() => {
              this.onClearForm();
            });
          }
        );
    }
  }

  onChangeEditMode(value: boolean): void {
    this.editMode = value;
  }

  onClickCancel(): void {
    this.createAlbumCategoryForm();
  }
}
