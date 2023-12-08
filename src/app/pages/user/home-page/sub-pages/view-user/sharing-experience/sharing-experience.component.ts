import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import {
  faSearch,
  faBookOpen,
  faBullhorn,
  faBell,
  faGear,
  faPencil,
  faPlus,
  faCheck,
  faXmark,
  faChevronRight,
  faEllipsis,
  faPenToSquare,
  faEllipsisVertical,
  faClock,
  faTimes,
  faCircleChevronRight,
  faCircleChevronLeft,
} from '@fortawesome/free-solid-svg-icons';
import { Subscription, debounceTime } from 'rxjs';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { SharingDTO } from '../../../dtos/sharing.dto';
import { HomePageService } from '../../../homepage.service';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-sharing-experience',
  templateUrl: './sharing-experience.component.html',
  styleUrls: ['./sharing-experience.component.css'],
})
export class SharingExperienceComponent
  extends BaseController
  implements OnInit, OnDestroy
{
  linked_icon = '../../../../assets/image/footer/linked-icon.png';
  instagram_icon = '../../../../assets/image/footer/instagram-icon.png';
  facebook_icon = '../../../../assets/image/fb.png';
  bg_library = '../../../../assets/image/library/bg-library.jpg';
  faSearch = faSearch;
  faBookOpen = faBookOpen;
  faBullhorn = faBullhorn;
  faBell = faBell;
  faGear = faGear;
  faPencil = faPencil;
  faPlus = faPlus;
  faCheck = faCheck;
  faXmark = faXmark;
  faChevronRight = faChevronRight;
  faEllipsis = faEllipsis;
  faPenToSquare = faPenToSquare;
  faEllipsisVertical = faEllipsisVertical;
  faClock = faClock;
  faTimes = faTimes;
  faCircleChevronRight = faCircleChevronRight;
  faCircleChevronLeft = faCircleChevronLeft;

  @Input() personalNumber!: string;

  id!: number | null;
  uuid!: string | null;
  addOredit!: boolean;

  obs!: Subscription;

  title: any;

  dataSharing: SharingDTO[] = [];

  page: number = 1;
  limit: number = 5;
  search: string = '';
  sortBy: string = 'desc';
  isAdmin: boolean = false;
  totalData: number = 0;
  pageData: Array<number> = [];
  isLoading: boolean = false;

  mform: FormGroup = new FormGroup({
    search: new FormControl(''),
    page: new FormControl(this.page),
    limit: new FormControl(this.limit),
    sortBy: new FormControl(this.sortBy),
  });

  constructor(private readonly homePageService: HomePageService) {
    super(SharingExperienceComponent.name);
  }

  ngOnInit(): void {
    this.getDataSharingExp(
      this.page,
      this.limit,
      this.search,
      this.sortBy,
      this.isAdmin,
      this.personalNumber
    );
    this.obs = this.mform.valueChanges
      .pipe(debounceTime(500))
      .subscribe((data) => {
        if (data.page < 1) {
          data.page < 1 ? this.mform.get('page')?.setValue(1) : data.page;
        } else {
          this.getDataSharingExp(
            data.page,
            data.limit,
            data.search,
            data.sortBy,
            this.isAdmin,
            this.personalNumber
          );
        }
      });
  }
  ngOnDestroy(): void {
    this.obs.unsubscribe();
  }

  //Get sharing
  async getDataSharingExp(
    page: number,
    limit: number,
    search: string,
    sortBy: string,
    isAdmin: boolean,
    personalNumber?: string
  ): Promise<void> {
    try {
      this.isLoading = true;
      this.homePageService
        .getSharingExp(page, limit, search, sortBy, isAdmin, personalNumber)
        .subscribe(
          (response) => {
            this.isLoading = false;
            this.dataSharing = response.data.result ?? [];
            this.totalData = response.data.total;
            this.paginate(this.totalData, this.limit, this.pageData);
          },
          (error) => {
            this.isLoading = false;
          }
        );
    } catch (error) {
      throw error;
    }
  }

  nextPage(): void {
    if (
      this.pageData.length > 1 &&
      this.mform.get('page')?.value < this.pageData.length
    ) {
      this.mform.get('page')?.setValue(this.mform.get('page')?.value + 1);
    }
  }
  changePage(page: number): void {
    if (this.pageData.length) {
      this.mform.get('page')?.setValue(page);
    }
  }
  prevPage(): void {
    if (this.pageData.length > 1 && this.mform.get('page')?.value > 1) {
      this.mform.get('page')?.setValue(this.mform.get('page')?.value - 1);
    }
  }
}
