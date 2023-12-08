import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { faStar, faEye, faFolderPlus } from '@fortawesome/free-solid-svg-icons';
import * as moment from 'moment';
import { Subject, takeUntil, tap } from 'rxjs';
import { EBookDTO } from 'src/app/core/dtos/nex-library/ebook.dto';
import { EBookDataService } from 'src/app/core/services/nex-library/ebook-data.service';
// import { environment } from 'src/environments/environment';
import { environment } from 'src/environments/environment.prod';
import { AddCommentRequestDTO } from './dto/add-comment-request.dto';
import { EBookReviewDataService } from 'src/app/core/services/nex-library/ebook-review-data.service';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';
import { EBookReviewDTO } from 'src/app/core/dtos/nex-library/ebook-review.dto';
import { PaginatorRequest } from 'src/app/core/requests/paginator.request';
import { ParamsRequest } from 'src/app/core/requests/params.request';
import { EbookCollectionRequestTO } from './dto/ebook-collection-request.dto';
import { EBookCollectionDataService } from 'src/app/core/services/nex-library/ebook-collection-data.service';
import { EBookCollectionDTO } from 'src/app/core/dtos/nex-library/ebook-colllection.dto';
import { KeycloakService } from 'keycloak-angular';
import { HeaderService } from 'src/app/core/services/header/header.service';
import { UserListDTO } from '../../../home-page/dtos/user-list.dto';
import { HomePageService } from '../../../home-page/homepage.service';

@Component({
  selector: 'app-detail-book',
  templateUrl: './detail-book.component.html',
  styleUrls: ['./detail-book.component.css'],
})
export class DetailBookComponent implements OnInit, OnDestroy {
  faStar = faStar;
  faEye = faEye;
  faFolderPlus = faFolderPlus;

  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  addCommentForm!: FormGroup;

  //uuid from URL
  uuid: string | null;

  //eBook Detail
  eBookDetailData: EBookDTO | undefined;

  eBookCollectionData: EBookCollectionDTO | undefined;

  eBookReviewData: EBookReviewDTO[];

  rates: Boolean[];

  paginator?: PaginatorRequest;
  dataRequest?: ParamsRequest;

  pages: number[];

  totalReviewRate: number;

  isLoading: boolean;
  isCommentLoading: boolean;

  isError: boolean;

  isMyEbookCollection: boolean;

  personalNumber: string;

  isAlreadyView: boolean;

  userComments: UserListDTO[];

  isReadBookModalOpen: boolean;

  constructor(
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly formBuilder: FormBuilder,
    private readonly eBookDataService: EBookDataService,
    private readonly eBookReviewDataService: EBookReviewDataService,
    private readonly eBookCollectionDataService: EBookCollectionDataService,
    private readonly keycloakService: KeycloakService,
    private readonly toastr: ToastrService,
    private readonly headerService: HeaderService,
    private readonly homePageService: HomePageService
  ) {
    const requestUuid = this.route.snapshot.paramMap.get('uuid');
    this.uuid = requestUuid;
    this.eBookReviewData = [];
    this.rates = [];
    this.totalReviewRate = 0;
    this.isLoading = false;
    this.isCommentLoading = false;
    this.pages = [];
    this.isError = false;
    this.isMyEbookCollection = false;
    this.personalNumber = '';
    this.isAlreadyView = false;
    this.userComments = [];
    this.isReadBookModalOpen = false;
  }

  ngOnInit(): void {
    this.initializeUserOptions();
    this.initPaginator();
    this.initParams();
    this.initEBookDetailData(true);
    this.createCommentForm();
  }

  ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();
  }

  //GET Personal Number from Keycloak
  private initializeUserOptions(): void {
    this.personalNumber = this.keycloakService.getUsername();
  }

  //Get Personal Info from SOE
  private getUserData(personal_number: string, index?: number): void {
    this.homePageService
      .getUserListByPersonalNumber(personal_number)
      .pipe(
        tap((response) => {
          response.data.userPhoto =
            environment.httpUrl +
            '/v1/api/file-manager/get-imagepdf/' +
            response.data.userPhoto;
        }),
        takeUntil(this._onDestroy$)
      )
      .subscribe((response) => {
        if (index !== undefined) {
          this.userComments[index] = response.data;
        }
      });
  }

  initEBookDetailData(refresh?: boolean): void {
    if (this.uuid) {
      if (refresh) {
        this.isLoading = true;
      }
      this.isError = false;
      this.eBookDataService
        .getEBookDetailDataByUuid(this.uuid)
        .pipe(
          tap((response) => {
            response.data.pathCover =
              environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' +
              response.data.pathCover;
            response.data.pathEbook =
              environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' +
              response.data.pathEbook;

            //calculate star rating from reviews
            let rateTotal = 0;
            let reviewsLength = response.data.ebooksEbookReviews.length;

            if (reviewsLength > 0) {
              response.data.ebooksEbookReviews.map((review) => {
                rateTotal += review.rate;
              });
              this.totalReviewRate = rateTotal / reviewsLength;
            }

            this.checkMyBookColllection({
              ebookId: response.data.id,
              personalNumber: this.personalNumber,
            });
          }),
          takeUntil(this._onDestroy$)
        )
        .subscribe(
          (response) => {
            if (refresh) {
              this.isLoading = false;
            }
            this.eBookDetailData = response.data;
            this.setBookIdValue(response.data.id);
            this.initEBookReviewData(refresh);
          },
          () => {
            if (refresh) {
              this.isLoading = false;
            }
            this.isError = true;
          }
        );
    }
  }

  initEBookReviewData(refresh?: boolean) {
    if (this.eBookDetailData) {
      let params: string = `page=${this.dataRequest?.page ?? 1}&limit=${
        this.dataRequest?.limit
      }&sortBy=desc`;
      if (this.eBookDetailData.id) {
        params += `&ebookId=${this.eBookDetailData.id}`;
      }

      if (refresh) {
        this.isCommentLoading = true;
      }

      this.eBookReviewDataService
        .getEBookReviewData(params)
        .pipe(
          tap((response) => {
            this.userComments = new Array(response.data.data.length).fill({
              personalName: '',
              personalUnit: '',
              personalImage: '',
            });
            response.data.data.map((dt, index) => {
              this.getUserData(dt.personalNumber, index);
            });
          }),
          takeUntil(this._onDestroy$)
        )
        .subscribe((response) => {
          if (refresh) {
            this.isCommentLoading = false;
          }
          this.eBookReviewData = response.data.data;
          if (this.paginator) {
            this.paginator.totalData = response.data.totalItems;
            this.paginator.totalPage = response.data.totalPages;
            this.pages = new Array(this.paginator.totalPage);
          }
        });
    }
  }

  initStarRates(): void {
    this.rates = [false, false, false, false, false];
  }

  checkMyBookColllection(input: EbookCollectionRequestTO): void {
    const request = {
      ebookId: input.ebookId,
      personalNumber: input.personalNumber,
    };

    this.eBookCollectionDataService.checkEbookCollectionData(request).subscribe(
      (success) => {
        this.isLoading = false;
        this.eBookCollectionData = success.data;
        this.isMyEbookCollection = success.data ? true : false;
      },
      (error) => {
        this.isLoading = false;
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong!',
        });
      }
    );
  }

  addBookColllection(): void {
    if (this.eBookDetailData) {
      const request = {
        ebookId: this.eBookDetailData.id,
        personalNumber: this.personalNumber,
      };

      this.eBookCollectionDataService
        .storeEbookCollectionData(request)
        .subscribe(
          (success) => {
            this.toastr.success(
              'The Ebook has been added to your collection',
              'Great Move..'
            );
            this.initEBookDetailData();
            this.resetCommentForm();
          },
          (error) => {
            this.toastr.error(error.error.message, 'Add Collection Failed');
          }
        );
    }
  }

  removeBookColllection(): void {
    if (this.eBookDetailData && this.eBookCollectionData) {
      this.eBookCollectionDataService
        .deleteEbookCollectionData(this.eBookCollectionData.uuid)
        .subscribe(
          (success) => {
            this.toastr.success(
              'The Ebook has been remoeved to your collection',
              'Great Move..'
            );
            this.resetCommentForm();
            this.initEBookDetailData();
          },
          (error) => {
            this.toastr.error(error.error.message, 'Remove Collection Failed');
          }
        );
    }
  }

  setBookIdValue(bookId: number): void {
    this.addCommentForm.patchValue({
      ebookId: bookId,
      personalNumber: this.personalNumber,
    });
  }

  createCommentForm(): void {
    this.addCommentForm = this.formBuilder.nonNullable.group({
      ebookId: ['', Validators.required],
      personalNumber: [''],
      message: ['', [Validators.required]],
      rate: [''],
    });
    this.initStarRates();
  }

  resetCommentForm(): void {
    this.addCommentForm.reset();
  }

  get message() {
    return this.addCommentForm.get('message');
  }

  onSubmit() {
    this.storeData(this.addCommentForm.value);
  }

  storeData(input: AddCommentRequestDTO): void {
    const object = {
      ebookId: input.ebookId,
      message: input.message,
      personalNumber: input.personalNumber,
      rate: this.rates.filter((rate) => rate === true).length,
    };

    this.eBookReviewDataService.storeEbookReviewData(object).subscribe(
      (success) => {
        this.toastr.success(
          'The Comment you posted has been submitted',
          'Great Move..'
        );
        this.initStarRates();
        this.resetCommentForm();
        this.initEBookDetailData();
      },
      (error) => {
        this.toastr.error(error.error.message, 'Post Comment Failed');
      }
    );
  }

  onClickRate(index: number, rate: Boolean): void {
    if (index === 0) {
      if (rate) {
        this.rates[0] = false;
        this.rates[1] = false;
        this.rates[2] = false;
        this.rates[3] = false;
        this.rates[4] = false;
      } else {
        this.rates[0] = true;
      }
    } else if (index === 1) {
      if (rate) {
        this.rates[1] = false;
        this.rates[2] = false;
        this.rates[3] = false;
        this.rates[4] = false;
      } else {
        this.rates[0] = true;
        this.rates[1] = true;
      }
    } else if (index === 2) {
      if (rate) {
        this.rates[2] = false;
        this.rates[3] = false;
        this.rates[4] = false;
      } else {
        this.rates[0] = true;
        this.rates[1] = true;
        this.rates[2] = true;
      }
    } else if (index === 3) {
      if (rate) {
        this.rates[3] = false;
        this.rates[4] = false;
      } else {
        this.rates[0] = true;
        this.rates[1] = true;
        this.rates[2] = true;
        this.rates[3] = true;
      }
    } else if (index === 4) {
      if (rate) {
        this.rates[4] = false;
      } else {
        this.rates[0] = true;
        this.rates[1] = true;
        this.rates[2] = true;
        this.rates[3] = true;
        this.rates[4] = true;
      }
    }
  }

  formattedDate(date: string): string {
    return moment(date).format('LLL');
  }

  initPaginator(): void {
    this.paginator = {
      pageOption: [5, 10, 20, 50],
      pageNumber: 1,
      pageSize: 5,
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

    this.rePaginateEbookReviews(true);
  }

  goToPageNumberByPageSelect(event: number): void {
    if (this.paginator) {
      this.paginator.pageNumber = Number(event);
      this.rePaginateEbookReviews(true);
    }
  }

  goToPageNumberByPageClick(event: any): void {
    if (this.paginator) {
      this.paginator.pageNumber = Number(event);
      this.rePaginateEbookReviews(true);
    }
  }

  changePageSize(): void {
    if (this.paginator) {
      this.paginator.pageNumber = 1;
      this.rePaginateEbookReviews(true);
    }
  }

  rePaginateEbookReviews(refresh?: boolean): void {
    if (this.paginator) {
      if (refresh) {
        this.paginator.pageNumber = 1;
        this.paginator.pageSize = 5;
      }

      if (this.dataRequest) {
        this.dataRequest.limit = this.paginator.pageSize;
        this.dataRequest.page = this.paginator.pageNumber;
        this.dataRequest.offset =
          (this.paginator.pageNumber - 1) * this.paginator.pageSize;
      }

      this.initEBookReviewData(refresh);
    }
  }

  openReadBookModal(uuid: string) {
    if (this.isAlreadyView === false) {
      this.isAlreadyView = true;
      this.eBookDataService.updateViewEbook(uuid).subscribe(
        () => {
          this.isReadBookModalOpen = true;
          this.initEBookDetailData();
        },
        (error) => {
          this.toastr.error(error.error.message, 'View Ebook Failed');
        }
      );
    } else {
      this.isReadBookModalOpen = true;
    }
  }
}
