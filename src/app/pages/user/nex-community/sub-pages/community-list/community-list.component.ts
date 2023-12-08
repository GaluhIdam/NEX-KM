import { Component, OnDestroy, OnInit } from '@angular/core';
import { NexCommunityService } from '../../nex-community.service';
import { Router } from '@angular/router';
import {
  faSearch,
  faChevronRight,
  faChevronCircleRight,
  faChevronCircleLeft,
  faUsers,
  faEye,
  faCircleChevronLeft,
  faCircleChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { CommunityDTO } from '../../dto/community.dto';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription, debounceTime, tap } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-community-list',
  templateUrl: './community-list.component.html',
  styleUrls: ['./community-list.component.css'],
})
export class CommunityListComponent
  extends BaseController
  implements OnInit, OnDestroy
{
  constructor(
    private readonly router: Router,
    private readonly nexcommunityService: NexCommunityService
  ) {
    super(CommunityListComponent.name);
  }

  obs!: Subscription;

  faSearch = faSearch;
  faChevronRight = faChevronRight;
  faChevronCircleRight = faChevronCircleRight;
  faChevronCircleLeft = faChevronCircleLeft;
  faCircleChevronLeft = faCircleChevronLeft;
  faCircleChevronRight = faCircleChevronRight;
  faUsers = faUsers;
  faEye = faEye;

  communityData: CommunityDTO[] = [];
  isAdmin: boolean = false;
  load: boolean = true;

  page: number = 1;
  limit: number = 20;
  limitActivity: number = 8;
  search: string = '';
  sortBy: string = 'createdAtDESC';

  totalData: number = 0;
  pageData: Array<number> = [];

  mform: FormGroup = new FormGroup({
    search: new FormControl(this.search),
    page: new FormControl(this.page),
    limit: new FormControl(this.limit),
  });

  ngOnInit(): void {
    this.getCommunityData(
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
          this.getCommunityData(
            data.page,
            data.limit,
            data.search,
            data.sortBy,
            this.isAdmin
          );
        }
      });
  }
  ngOnDestroy(): void {
    this.obs.unsubscribe();
  }

  //Get Community
  async getCommunityData(
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
                image.headlinedPhotoPath =
                  environment.httpUrl +
                  '/v1/api/file-manager/get-imagepdf/' +
                  image.headlinedPhotoPath;
                image.thumbnailPhotoPath =
                  environment.httpUrl +
                  '/v1/api/file-manager/get-imagepdf/' +
                  image.thumbnailPhotoPath;
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
