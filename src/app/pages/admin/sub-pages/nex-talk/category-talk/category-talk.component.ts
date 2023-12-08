import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Data, NavigationEnd, Router } from '@angular/router';
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
import { KeycloakService } from 'keycloak-angular';
import { Subject, filter, takeUntil, tap } from 'rxjs';
import { TalkCategoryDTO } from 'src/app/core/dtos/nex-talk/talk-category.dto';
import { PaginatorRequest } from 'src/app/core/requests/paginator.request';
import { ParamsRequest } from 'src/app/core/requests/params.request';
import { TalkCategoryDataService } from 'src/app/core/services/nex-talk/talk-category.service';
import Swal from 'sweetalert2';
import { Modal, initTE, Ripple } from 'tw-elements';

@Component({
  selector: 'app-category-talk',
  templateUrl: './category-talk.component.html',
  styleUrls: ['./category-talk.component.css'],
})
export class CategoryTalkComponent implements OnInit, OnDestroy {
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

  title: Data | undefined;

  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  paginator?: PaginatorRequest;
  dataRequest?: ParamsRequest;

  //talk category data
  talkCategoryData: TalkCategoryDTO[];

  selectedTalkCategory: TalkCategoryDTO | undefined;

  //default params
  searchValue: String;
  sortBy: string;
  sortStatus: number;

  pages: number[];

  isLoading: boolean;

  talkCategoryForm!: FormGroup;

  editMode: boolean;

  personalNumber: string;

  tableColumnHovers: boolean[];
  showTooltips: boolean[];

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly titleService: Title,
    private readonly formBuilder: FormBuilder,
    private readonly talkCategoryDataService: TalkCategoryDataService,
    private readonly keycloakService: KeycloakService
  ) {
    this.initTitlePage();

    this.talkCategoryData = [];
    this.pages = [];
    this.searchValue = '';
    this.sortBy = 'asc';
    this.sortStatus = 0;
    this.isLoading = false;
    this.editMode = false;
    this.personalNumber = '';
    this.tableColumnHovers = new Array(5).fill(false);
    this.showTooltips = [];
  }

  ngOnInit(): void {
    initTE({ Modal, Ripple });
    this.initializeUserOptions();
    this.initPaginator();
    this.initParams();
    this.createTalkCategoryForm();

    this.initTalkCategoryData();
  }

  ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();
  }

  //GET Personal Number from Keycloak
  private initializeUserOptions(): void {
    this.personalNumber = this.keycloakService.getUsername();
  }

  initTitlePage(): void {
    this.activatedRoute.data.subscribe((data) => {
      this.title = data;
    });
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        var rt = this.getChild(this.activatedRoute);

        rt.data.subscribe((data: { title: string }) => {
          this.titleService.setTitle('Nex ' + data.title);
        });
      });
  }

  getChild(activatedRoute: ActivatedRoute): any {
    if (activatedRoute.firstChild) {
      return this.getChild(activatedRoute.firstChild);
    } else {
      return activatedRoute;
    }
  }

  initTalkCategoryData(): void {
    this.isLoading = true;
    let params: string = `page=${this.dataRequest?.page ?? 1}&limit=${
      this.dataRequest?.limit
    }&search=${this.searchValue}&sortBy=${this.sortBy}`;
    this.talkCategoryDataService
      .getTalkCategoryData(params)
      .pipe(
        tap((response) => {
          this.showTooltips = new Array(response.data.data.length).fill(false);
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe((response) => {
        this.talkCategoryData = response.data.data;
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
    this.initTalkCategoryData();
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

      this.initTalkCategoryData();
    }
  }

  createTalkCategoryForm(): void {
    this.talkCategoryForm = this.formBuilder.nonNullable.group({
      name: ['', Validators.required],
      personalNumber: [this.personalNumber, Validators.required],
    });
  }

  openEditorModal(selectedCategory: TalkCategoryDTO) {
    this.selectedTalkCategory = selectedCategory;
    this.setDefaultValue(selectedCategory);
  }

  get name() {
    return this.talkCategoryForm.get('name');
  }

  setDefaultValue(data: TalkCategoryDTO) {
    this.talkCategoryForm.patchValue({
      name: data.name,
    });
  }

  onSubmit() {
    if (!this.talkCategoryForm.valid) {
      return;
    }

    if (this.editMode) {
      //state for edit Category
      if (this.selectedTalkCategory) {
        this.onUpdateCategory(
          this.selectedTalkCategory.uuid,
          this.talkCategoryForm
        );
      }
    } else {
      //state for add new Category
      this.onStoreCategory(this.talkCategoryForm);
    }
  }

  onStoreCategory(form: FormGroup): void {
    this.talkCategoryDataService.storeTalkCategoryData(form.value).subscribe(
      (success) => {
        Swal.fire({
          icon: 'success',
          title: 'Great Move..',
          text: 'The Talk Category you inputed has been added',
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
    this.talkCategoryDataService
      .updateTalkCategoryData(uuid, form.value)
      .subscribe(
        (success) => {
          Swal.fire({
            icon: 'success',
            title: 'Great Move..',
            text: 'The Talk Category you selected has been edited',
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
    this.createTalkCategoryForm();
    this.rePaginate();
  }

  onSelectTalkCategory(data: TalkCategoryDTO): void {
    this.selectedTalkCategory = data;
  }

  changeTalkCategoryStatus(status: boolean): void {
    if (this.selectedTalkCategory) {
      this.isLoading = true;

      const request = {
        status: status,
      };

      this.talkCategoryDataService
        .updateTalkCategoryStatus(this.selectedTalkCategory.uuid, request)
        .subscribe(
          (success) => {
            this.onClearForm();
            Swal.fire({
              icon: 'success',
              title: 'Great Move..',
              text: status
                ? 'The Category you selected has been activated'
                : 'The Category you selected has been deactivated',
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

  calculateItemCount(category: TalkCategoryDTO): number {
    let result = category.forums.length + category.streams.length;

    if (category.creators.length > 0) {
      result += category.creators.length;
      category.creators.map((creator) => {
        if (creator.series.length > 0) {
          result += creator.series.length;
          creator.series.map((serie) => {
            if (serie.seriesPodcast.length > 0) {
              result += serie.seriesPodcast.length;
            }
          });
        }
      });
    }
    return result;
  }

  onChangeEditMode(value: boolean): void {
    this.editMode = value;
  }

  onClickCancel(): void {
    this.createTalkCategoryForm();
  }
}
