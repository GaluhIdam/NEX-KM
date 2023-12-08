import { SoeDTO } from './../../../../../core/soe/soe.dto';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { EMPTY, Subject, Subscription, catchError, debounceTime, filter, of, switchMap, takeUntil, tap } from 'rxjs';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { NexLevelService } from 'src/app/pages/user/nex-level/nex-level.service';
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
  faSort,
} from '@fortawesome/free-solid-svg-icons';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RedeemDTO, RedeemStatusDTO } from 'src/app/pages/user/nex-level/dtos/redeem.dto';
import { Input, Select, Modal, Ripple, initTE } from 'tw-elements';
import { SoeService } from 'src/app/core/soe/soe.service';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-redeemed',
  templateUrl: './redeemed.component.html',
  styleUrls: ['./redeemed.component.css'],
})
export class RedeemedComponent
  extends BaseController
  implements OnInit, OnDestroy
{
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private readonly nexlevelservice: NexLevelService,
    private readonly keycloackService: KeycloakService,
    private readonly soeService: SoeService,
  ) {
    super(RedeemedComponent.name);
    this.initTitle();
  }

  private readonly unsubscribe$ = new Subject();
  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  title: any;

  obs!: Subscription;

  id!: number | null;
  uuid!: string | null;
  addOredit!: boolean;

  faSort = faSort;
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

  redeemData: RedeemDTO[] = [];
  userName!: string;
  page: number = 1;
  limit: number = 10;
  search: string = '';
  sortBy: string = 'trending';
  optionx: string = 'false';
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
    initTE({ Input, Select, Modal, Ripple });
    this.getUser(this.keycloackService.getUsername());
    this.getDataRedeem(this.page, this.limit, this.search, this.sortBy);
    this.obs = this.mform.valueChanges
      .pipe(debounceTime(500))
      .subscribe((data) => {
        if (data.page < 1) {
          data.page < 1 ? this.mform.get('page')?.setValue(1) : data.page;
        } else {
          this.getDataRedeem(data.page, data.limit, data.search, this.sortBy);
        }
      });
  }

  ngOnDestroy(): void {}

  //Get User
  getUser(personalNumber: string): void {
    this.soeService.getUserData(personalNumber)
      .pipe(
        catchError((err) => {
          console.error(err);
          err('error', err);
          return EMPTY;
        }),
        switchMap((result) => (
          this.userName = result.personalName
        )),
        takeUntil(this._onDestroy$)
      )
      .subscribe();
  }

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

  async getDataRedeem(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): Promise<void> {
    try {
      this.nexlevelservice
        .getRedeem(page, limit, search, sortBy)
        .pipe(
          tap((data) => {
            this.totalData = data.data.total;
            this.paginate(this.totalData, this.limit, this.pageData);
          }),
          switchMap((data) => {
            this.redeemData = data.data.result;
            console.log(this.redeemData)
            return of(data);
          })
        )
        .subscribe();
    } catch (error) {
      throw error;
    }
  }

  //On Change Data Desc Status
  onFormData(data: any): void {
    this.descStatus = data.descStatus;
  }

  //Post Approve or Reject
  approveReject(uuid: string, status: boolean): void {
    this.nexlevelservice
      .getUser(this.keycloackService.getUsername())
      .subscribe((data) => {
        const dto: RedeemStatusDTO = {
          status: status,
          descStatus: this.descStatus = '' ? null : this.descStatus,
          approvalBy: data.personalName
        };
        this.nexlevelservice

      })
  }

  postRedeem(): void {}

  updateDataRedeem(): void {}

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
