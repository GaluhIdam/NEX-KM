import { Component, OnDestroy, OnInit } from '@angular/core';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { NexCommunityService } from '../../nex-community.service';
import {
  faCircleChevronLeft,
  faCircleChevronRight,
  faImage,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import { RecentActivityDTO } from '../../dto/community.dto';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription, debounceTime, tap } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-community-activity',
  templateUrl: './community-activity.component.html',
  styleUrls: ['./community-activity.component.css'],
})
export class CommunityActivityComponent
  extends BaseController
  implements OnInit, OnDestroy
{
  constructor(private readonly nexcommunityService: NexCommunityService) {
    super(CommunityActivityComponent.name);
  }
  faSearch = faSearch;
  faCircleChevronLeft = faCircleChevronLeft;
  faCircleChevronRight = faCircleChevronRight;
  faImage = faImage;
  dataActivity: Array<RecentActivityDTO> = [];
  page: number = 1;
  search: string = '';
  sortBy: string = 'createdAtDESC';
  limit: number = 8;
  totalData: number = 0;
  pageData: Array<number> = [];

  mformPaginate: FormGroup = new FormGroup({
    search: new FormControl(this.search),
    page: new FormControl(this.page),
    limit: new FormControl(this.limit),
    sortBy: new FormControl(this.sortBy),
  });

  obs!: Subscription;

  ngOnInit(): void {
    this.getActivityDataAll(this.page, this.limit, this.search, this.sortBy);
    this.obs = this.mformPaginate.valueChanges
      .pipe(debounceTime(500))
      .subscribe((data) => {
        if (data.page < 1) {
          data.page < 1
            ? this.mformPaginate.get('page')?.setValue(1)
            : data.page;
        } else {
          this.getActivityDataAll(
            data.page,
            data.limit,
            data.search,
            data.sortBy
          );
        }
      });
  }
  ngOnDestroy(): void {
    this.obs.unsubscribe();
  }

  async getActivityDataAll(
    page: number,
    limit: number,
    search: string,
    sortBy: string
  ): Promise<void> {
    try {
      this.nexcommunityService
        .getActivityAll(page, limit, search, sortBy)
        .pipe(
          tap((data) => {
            if (data.data.result) {
              data.data.result.forEach((image) => {
                image.path =
                  environment.httpUrl +
                  '/v1/api/file-manager/get-imagepdf/' +
                  image.path;
              });
            }
          })
        )
        .subscribe((response) => {
          this.dataActivity = response.data.result;
          this.totalData = response.data.total;
          this.paginate(
            this.totalData,
            this.mformPaginate.get('limit')?.value,
            this.pageData
          );
        });
    } catch (error) {
      throw error;
    }
  }

  nextPage(): void {
    if (this.pageData.length > 1) {
      this.mformPaginate
        .get('page')
        ?.setValue(this.mformPaginate.get('page')?.value + 1);
    }
  }

  prevPage(): void {
    if (this.pageData.length > 1) {
      this.mformPaginate
        .get('page')
        ?.setValue(this.mformPaginate.get('page')?.value - 1);
    }
  }
}
