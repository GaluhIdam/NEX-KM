import { Component } from '@angular/core';
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
  faCircleChevronLeft,
  faCircleChevronRight,
  faSadTear,
} from '@fortawesome/free-solid-svg-icons';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { Modal, Ripple, initTE } from 'tw-elements';
import { Subscription, debounceTime, filter, tap } from 'rxjs';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { NexCommunityService } from 'src/app/pages/user/nex-community/nex-community.service';
import {
  CommunityDTO,
  CommunityPublishPrivateDTO,
} from 'src/app/pages/user/nex-community/dto/community.dto';
import { FormControl, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-community',
  templateUrl: './community.component.html',
  styleUrls: ['./community.component.css'],
})
export class CommunityComponent extends BaseController {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private readonly nexcommunityService: NexCommunityService
  ) {
    super(CommunityComponent.name);
    this.initTab();
  }

  load: boolean = true;

  faArrowRight = faArrowRight;
  faCircleChevronLeft = faCircleChevronLeft;
  faCircleChevronRight = faCircleChevronRight;
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
  faSadTear = faSadTear;

  obs!: Subscription;

  descStatus: string | null = null;

  title: any;

  communityData: CommunityDTO[] = [];

  page: number = 1;
  limit: number = 10;
  search: string = '';
  sortBy: string = 'membersASC';
  isAdmin: boolean = true;
  totalData: number = 0;
  pageData: Array<number> = [];

  mform: FormGroup = new FormGroup({
    search: new FormControl(this.search),
    page: new FormControl(this.page),
    limit: new FormControl(this.limit),
  });

  ngOnInit() {
    initTE({ Modal, Ripple });
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
    this.communityDataAll(
      this.page,
      this.limit,
      this.search,
      this.sortBy,
      this.isAdmin
    );
    this.obs = this.mform.valueChanges
      .pipe(debounceTime(500))
      .subscribe((data) => {
        if (data.page < 1) {
          data.page < 1 ? this.mform.get('page')?.setValue(1) : data.page;
        } else {
          this.communityDataAll(
            data.page,
            data.limit,
            data.search,
            data.sortBy,
            this.isAdmin
          );
        }
      });
  }

  initTab(): void {
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
    this.communityDataAll(
      this.page,
      this.limit,
      this.search,
      this.sortBy,
      this.isAdmin
    );
    this.obs = this.mform.valueChanges
      .pipe(debounceTime(500))
      .subscribe((data) => {
        if (data.page < 1) {
          data.page < 1 ? this.mform.get('page')?.setValue(1) : data.page;
        } else {
          this.communityDataAll(
            data.page,
            data.limit,
            data.search,
            data.sortBy,
            this.isAdmin
          );
        }
      });
  }
  getChild(activatedRoute: ActivatedRoute): any {
    if (activatedRoute.firstChild) {
      return this.getChild(activatedRoute.firstChild);
    } else {
      return activatedRoute;
    }
  }

  async communityDataAll(
    page: number,
    limit: number,
    search: string,
    sortBy: string,
    isAdmin: boolean
  ): Promise<void> {
    try {
      this.nexcommunityService
        .getCommunity(page, limit, search, sortBy, isAdmin)
        .pipe(
          tap((data) => {
            if (data.data.result) {
              data.data.result.forEach((image) => {
                image.thumbnailPhotoPath =
                  environment.httpUrl +
                  '/v1/api/file-manager/get-imagepdf/' +
                  image.thumbnailPhotoPath;
                image.headlinedPhotoPath =
                  environment.httpUrl +
                  '/v1/api/file-manager/get-imagepdf/' +
                  image.headlinedPhotoPath;
              });
            }
          })
        )
        .subscribe((response) => {
          this.totalData = response.data.total;
          this.communityData = response.data.result;
          this.paginate(
            this.totalData,
            this.mform.get('limit')?.value,
            this.pageData
          );
          this.load = false;
        });
    } catch (error) {
      Swal.fire({
        icon: 'success',
        title: 'Approved!',
        text: `${error}`,
        timer: 2000,
        showConfirmButton: false,
      });
      throw error;
    }
  }

  //On Change Data Desc Status
  onFormData(data: any): void {
    this.descStatus = data.descStatus;
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

  //Publish or Private
  async approveReject(uuid: string, status: boolean): Promise<void> {
    const dto: CommunityPublishPrivateDTO = {
      status: status,
    };
    this.nexcommunityService
      .publishPrivateCommunity(uuid, dto)
      .subscribe(() => {
        if (dto.status) {
          Swal.fire({
            icon: 'success',
            title: 'Published!',
            text: 'Community was successfully published.',
            timer: 1000,
            showConfirmButton: false,
          }).then(() => {
            this.communityDataAll(
              this.page,
              this.limit,
              this.search,
              this.sortBy,
              this.isAdmin
            );
          });
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Privated!',
            text: 'Community was successfully privated.',
            timer: 1000,
            showConfirmButton: false,
          }).then(() => {
            this.communityDataAll(
              this.page,
              this.limit,
              this.search,
              this.sortBy,
              this.isAdmin
            );
          });
        }
      });
  }

  //Ban Community
  async banCommunityStatus(uuid: string, status: boolean): Promise<void> {
    try {
      const statusChekc = status == true ? false : true;
      const dto: CommunityPublishPrivateDTO = {
        status: statusChekc,
      };
      this.nexcommunityService.banCommunity(uuid, dto).subscribe(() => {
        if (statusChekc) {
          Swal.fire({
            icon: 'success',
            title: 'Banned!',
            text: 'Community was successfully permitted.',
            timer: 1000,
            showConfirmButton: false,
          }).then(() => {
            this.communityDataAll(
              this.page,
              this.limit,
              this.search,
              this.sortBy,
              this.isAdmin
            );
          });
        } else {
          Swal.fire({
            icon: 'success',
            title: 'Permitted!',
            text: 'Community was successfully banned.',
            timer: 1000,
            showConfirmButton: false,
          }).then(() => {
            this.communityDataAll(
              this.page,
              this.limit,
              this.search,
              this.sortBy,
              this.isAdmin
            );
          });
        }
      });
    } catch (error) {
      throw error;
    }
  }
}
