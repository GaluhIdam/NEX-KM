import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { UserListDTO } from 'src/app/pages/user/home-page/dtos/user-list.dto';
import { HomePageService } from 'src/app/pages/user/home-page/homepage.service';
import {
  faArrowRight,
  faBell,
  faGear,
  faSearch,
  faFilter,
  faPrint,
  faCircleCheck,
  faEye,
  faStar,
  faBan,
  faXmark,
  faPencil,
  faPlus,
  faTrash,
  faBookmark,
  faCircleChevronLeft,
  faCircleChevronRight,
  faSadTear,
  faListCheck,
} from '@fortawesome/free-solid-svg-icons';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css'],
})
export class UserListComponent
  extends BaseController
  implements OnInit, OnDestroy
{
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private readonly homepageService: HomePageService
  ) {
    super(UserListComponent.name);
    this.initTitle();
  }

  title: any;

  obs!: Subscription;

  id!: number | null;
  uuid!: string | null;
  addOredit!: boolean;

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
  faTrash = faTrash;
  faBookmark = faBookmark;
  faCircleChevronLeft = faCircleChevronLeft;
  faCircleChevronRight = faCircleChevronRight;
  faSadTear = faSadTear;
  faListCheck = faListCheck;

  dataUser: UserListDTO[] = [];

  page: number = 1;
  limit: number = 10;
  search: string = '';
  sortBy: string = 'desc';
  totalData: number = 0;
  pageData: Array<number> = [];
  descStatus: string | null = null;

  mform: FormGroup = new FormGroup({
    search: new FormControl(''),
    page: new FormControl(this.page),
    limit: new FormControl(this.limit),
  });

  submitForm: FormGroup = new FormGroup({
    title: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    this.getDataUserList(this.page, this.limit, this.search, this.sortBy);
  }
  ngOnDestroy(): void {}

  initTitle(): void {
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

  //Get User List
  async getDataUserList(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): Promise<void> {
    try {
      this.homepageService
        .getUserList(page, limit, search, sortBy)
        .subscribe((response) => {
          this.dataUser = response.data.result;
          console.log(this.dataUser)
          this.totalData = response.data.total;
          this.paginate(this.totalData, limit, this.pageData);
        });
    } catch (error) {
      throw error;
    }
  }

  nextPage(): void {
    if (this.pageData.length > 1) {
      this.mform.get('page')?.setValue(this.mform.get('page')?.value + 1);
    }
  }
  prevPage(): void {
    if (this.pageData.length > 1) {
      this.mform.get('page')?.setValue(this.mform.get('page')?.value - 1);
    }
  }

  reset(): void {
    this.submitForm.get('title')?.reset();
  }

  callModal(
    title: string | null,
    id: number | null,
    uuid: string | null,
    addOredit: boolean
  ): void {
    this.submitForm.get('title')?.reset();
    this.submitForm.get('title')?.setValue(title);
    this.id = id;
    this.uuid = uuid;
    this.addOredit = addOredit;
  }
}
