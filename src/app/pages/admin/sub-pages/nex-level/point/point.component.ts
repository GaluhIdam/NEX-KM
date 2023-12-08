import { Component, OnDestroy, OnInit } from '@angular/core';
import { BaseController } from 'src/app/core/BaseController/base-controller';
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
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { KeycloakService } from 'keycloak-angular';
import {
  Subscription,
  filter,
  switchMap,
  map,
  debounceTime,
  pipe,
  tap,
} from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PointDTO } from 'src/app/pages/user/nex-level/dtos/point.dto';
import { NexLevelService } from 'src/app/pages/user/nex-level/nex-level.service';

@Component({
  selector: 'app-point',
  templateUrl: './point.component.html',
  styleUrls: ['./point.component.css'],
})
export class PointComponent
  extends BaseController
  implements OnInit, OnDestroy
{
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private readonly nexlevelService: NexLevelService,
    private readonly keycloakService: KeycloakService
  ) {
    super(PointComponent.name);
    this.initTitle();
  }

  title: any;

  obs!: Subscription;

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

  page: number = 1;
  limit: number = 10;
  search: string = '';
  sortBy: string = 'desc';
  optionx: string = 'false';
  totalData: number = 0;
  pageData: Array<number> = [];
  descStatus: string | null = null;

  dataPoint!: Array<PointDTO>;

  mform: FormGroup = new FormGroup({
    search: new FormControl(''),
    page: new FormControl(this.page),
    limit: new FormControl(this.limit),
  });

  submitForm: FormGroup = new FormGroup({
    title: new FormControl('', [Validators.required]),
  });

  ngOnInit(): void {
    this.getDataPoint(this.page, this.limit, this.search, this.sortBy);
    this.obs = this.mform.valueChanges
      .pipe(debounceTime(500))
      .subscribe((data) => {
        if (data.page < 1) {
          data.page < 1 ? this.mform.get('page')?.setValue(1) : data.page;
        } else {
          this.getDataPoint(data.page, data.limit, data.search, data.sortBy);
        }
      });
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

  async getDataPoint(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): Promise<void> {
    try {
      this.nexlevelService
        .getPoint(page, limit, search, sortBy)
        .pipe(
          tap((data) => {
            if (data.data.result) {
              this.nexlevelService.getAllMile().subscribe((r) => {
                data.data.result.forEach((dtx) => {
                  if (r.data.result) {
                    r.data.result.forEach((dty) => {
                      if (
                        dtx.totalPoint >= dty.minPoint &&
                        dtx.totalPoint <= dty.maxPoint
                      ) {
                        dtx.levelPoint = dty.name;
                      }
                    });
                  }
                });
              });
            }
          })
        )
        .subscribe((response) => {
          this.dataPoint = response.data.result;
          this.totalData = response.data.total;
          this.paginate(this.totalData, this.limit, this.pageData);
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
}
