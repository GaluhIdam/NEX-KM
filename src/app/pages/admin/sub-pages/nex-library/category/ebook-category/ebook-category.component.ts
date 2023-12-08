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
import { Subject, takeUntil, tap } from 'rxjs';
import { PaginatorRequest } from 'src/app/core/requests/paginator.request';
import { EBookCategoryDTO } from 'src/app/core/dtos/nex-library/ebook-category.dto';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EBookCategoryDataService } from 'src/app/core/services/nex-library/ebook-category-data.service';
import Swal from 'sweetalert2';
import { ParamsRequest } from 'src/app/core/requests/params.request';
import { Modal, initTE, Ripple } from 'tw-elements';
import { NotificationRequestDTO } from 'src/app/pages/user/home-page/dtos/notification.dto';
import { KeycloakService } from 'keycloak-angular';
import { SocketService } from 'src/app/core/utility/socket-io-services/socket.io.service';
import { HomePageService } from 'src/app/pages/user/home-page/homepage.service';

@Component({
  selector: 'app-ebook-category',
  templateUrl: './ebook-category.component.html',
  styleUrls: ['./ebook-category.component.css'],
})
export class EbookCategoryComponent implements OnInit, OnDestroy {
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

  //ebook category data
  ebookCategoryData: EBookCategoryDTO[];

  selectedEbookCategory: EBookCategoryDTO | undefined;

  //default params
  searchValue: String;
  sortBy: string;
  sortStatus: number;

  pages: number[];

  isLoading: boolean;

  ebookCategoryForm!: FormGroup;

  editMode: boolean;

  showTooltips: boolean[];

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly ebookCategoryDataService: EBookCategoryDataService,
    private readonly keycloakService: KeycloakService,
    private readonly webSocket: SocketService,
    private readonly homepageService: HomePageService
  ) {
    this.ebookCategoryData = [];
    this.pages = [];
    this.searchValue = '';
    this.sortBy = 'asc';
    this.sortStatus = 0;
    this.isLoading = true;
    this.personalNumber = '';
    this.editMode = false;
    this.showTooltips = [];
  }

  ngOnInit(): void {
    initTE({ Modal, Ripple });
    this.initPaginator();
    this.initParams();
    this.createEbookCategoryForm();
    this.initEbookCategoryData();
  }

  ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();
  }

  initEbookCategoryData(): void {
    this.isLoading = true;
    let params: string = `page=${this.dataRequest?.page ?? 1}&limit=${
      this.dataRequest?.limit
    }&search=${this.searchValue}&sortBy=${this.sortBy}`;
    this.ebookCategoryDataService
      .getEBookCategoryData(params)
      .pipe(takeUntil(this._onDestroy$))
      .subscribe((response) => {
        this.showTooltips = new Array(response.data.data.length).fill(false);
        this.ebookCategoryData = response.data.data;
        this.isLoading = false;
        if (this.paginator) {
          this.paginator.totalData = response.data.totalItems;
          this.paginator.totalPage = response.data.totalPages;
          this.pages = new Array(this.paginator.totalPage);
        }
      });
  }

  searchByField(event: any): void {
    this.searchValue = event.target.value;
    this.initEbookCategoryData();
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

      this.initEbookCategoryData();
    }
  }

  createEbookCategoryForm(): void {
    this.ebookCategoryForm = this.formBuilder.group({
      name: ['', Validators.required],
      personalNumber: [this.personalNumber, Validators.required],
    });
  }

  openEditorModal(selectedCategory: EBookCategoryDTO) {
    this.selectedEbookCategory = selectedCategory;
    this.setDefaultValue(selectedCategory);
  }

  get name() {
    return this.ebookCategoryForm.get('name');
  }

  setDefaultValue(data: EBookCategoryDTO) {
    this.ebookCategoryForm.patchValue({
      name: data.name,
    });
  }

  onSubmit() {
    if (!this.ebookCategoryForm.valid) {
      return;
    }

    if (this.editMode) {
      //state for edit Category
      if (this.selectedEbookCategory) {
        this.onUpdateCategory(
          this.selectedEbookCategory.uuid,
          this.ebookCategoryForm
        );
      }
    } else {
      //state for add new Category
      this.onStoreCategory(this.ebookCategoryForm);
    }
  }

  onStoreCategory(form: FormGroup): void {
    this.ebookCategoryDataService.storeEbookCategoryData(form.value).subscribe(
      (success) => {
        Swal.fire({
          icon: 'success',
          title: 'Great Move..',
          text: 'The Ebook Category you inputed has been added',
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
    this.ebookCategoryDataService
      .updateEbookCategoryData(uuid, form.value)
      .subscribe(
        (success) => {
          Swal.fire({
            icon: 'success',
            title: 'Great Move..',
            text: 'The Ebook Category you selected has been edited',
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
    this.createEbookCategoryForm();
  }

  onSelectEbookCategory(data: EBookCategoryDTO): void {
    this.selectedEbookCategory = data;
  }

  changeEbookCategoryStatus(status: boolean): void {
    if (this.selectedEbookCategory) {
      const request = {
        isActive: status,
      };

      this.ebookCategoryDataService
        .updateEbookCategoryStatus(this.selectedEbookCategory.uuid, request)
        .subscribe(
          (success) => {
            this.onClearForm();
            Swal.fire({
              icon: 'success',
              title: 'Great Move..',
              text: status
                ? 'The Ebook category you selected has been activated'
                : 'The Ebook category you selected has been deactivated',
            });
          },
          (error) => {
            this.onClearForm();
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: error.error.message,
            });
          }
        );
    }
  }

  onChangeEditMode(value: boolean): void {
    this.editMode = value;
  }

  onClickCancel(): void {
    this.createEbookCategoryForm();
  }
}
