import { BaseController } from 'src/app/core/BaseController/base-controller';
import { Subscription, debounceTime, tap } from 'rxjs';
import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  faArrowRight,
  faBookBookmark,
  faBookOpen,
  faSearch,
  faVideo,
  faArrowUpFromBracket,
  faCircleChevronLeft,
  faCircleChevronRight,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import { KeycloakService } from 'keycloak-angular';
import { NexLearningService } from '../../nex-learning.service';
import { StoryDTO } from '../../dtos/story.dto';
import { FormControl, FormGroup } from '@angular/forms';
import { PlyrComponent } from 'ngx-plyr';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-inspirational-story',
  templateUrl: './inspirational-story.component.html',
  styleUrls: ['./inspirational-story.component.css'],
})
export class InspirationalStoryComponent
  extends BaseController
  implements OnInit, OnDestroy
{
  constructor(
    private readonly router: Router,
    private readonly keycloakService: KeycloakService,
    private readonly nexLearningService: NexLearningService
  ) {
    super(InspirationalStoryComponent.name);
  }

  obs!: Subscription;
  urlAvatar: string = environment.httpUrl + '/v1/api/file-manager/avatar/';

  faArrowRight = faArrowRight;
  faChevronRight = faChevronRight;
  faBookBookmark = faBookBookmark;
  faBookOpen = faBookOpen;
  faSearch = faSearch;
  faVideo = faVideo;
  faArrowUpFromBracket = faArrowUpFromBracket;
  faCircleChevronLeft = faCircleChevronLeft;
  faCircleChevronRight = faCircleChevronRight;
  inspiStory: Array<StoryDTO> = [];
  photo!: string;

  totalData: number = 0;
  pageData: Array<number> = [];
  page: number = 1;
  limit: number = 10;
  category: string = 'Inspirational';
  sortBy: string = 'trending';
  search: string = '';
  photo_default: string =
    'https://st3.depositphotos.com/1767687/16607/v/450/depositphotos_166074422-stock-illustration-default-avatar-profile-icon-grey.jpg';
  mform: FormGroup = new FormGroup({
    search: new FormControl(this.search),
    page: new FormControl(this.page),
    limit: new FormControl(this.limit),
  });

  ngOnInit(): void {
    this.getStoryInspirational(
      this.page,
      this.limit,
      '',
      this.category,
      this.sortBy
    );
    this.obs = this.mform.valueChanges
      .pipe(debounceTime(500))
      .subscribe((data) => {
        if (data.page < 1) {
          data.page < 1 ? this.mform.get('page')?.setValue(1) : data.page;
        } else {
          this.getStoryInspirational(
            data.page,
            data.limit,
            data.search,
            this.category,
            this.sortBy
          );
        }
      });
    this.checkphoto(this.keycloakService.getUsername());
  }

  ngOnDestroy(): void {
    this.obs.unsubscribe();
  }

  //Get Story
  async getStoryInspirational(
    page: number,
    limit: number,
    search: string,
    category: string,
    sortBy: string
  ): Promise<void> {
    this.nexLearningService
      .getStory(page, limit, search, category, sortBy)
      .pipe(
        tap((response) => {
          if (response.data.result) {
            response.data.result.forEach((image) => {
              image.path =
                environment.httpUrl +
                '/v1/api/file-manager/get-imagepdf/' +
                image.path;
              image.cover =
                environment.httpUrl +
                '/v1/api/file-manager/get-imagepdf/' +
                image.cover;
            });
          }
        })
      )
      .subscribe((data) => {
        this.inspiStory = data.data.result;
        this.totalData = data.data.total;
        this.paginate(
          this.totalData,
          this.mform.get('limit')?.value,
          this.pageData
        );
      });
  }

  //View Story
  viewStory(uuid: string): void {
    this.router.navigate(['/user/nex-learning/story-view/' + uuid]);
  }

  //Go to Upload
  upload(): void {
    this.router.navigate(['/user/nex-learning/story-publish']);
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

  async gettingUser(personalNumber: string): Promise<void> {
    try {
      this.nexLearningService.getUser(personalNumber).subscribe((data) => {
        return data.personalName;
      });
    } catch (error) {
      throw error;
    }
  }

  //Media Player
  @ViewChild(PlyrComponent, { static: true })
  plyr!: PlyrComponent;

  player!: Plyr;

  played(event: Plyr.PlyrEvent) {}

  play(): void {
    this.player.play();
  }

  pause(): void {
    this.player.pause();
  }

  stop(): void {
    this.player.stop();
  }

  //Check Photo
  private async checkphoto(personal_number: string): Promise<void> {
    const imageUrl = `https://talentlead.gmf-aeroasia.co.id/images/avatar/${personal_number}.jpg`;

    const img = new Image();
    img.onload = () => {
      this.photo = imageUrl;
    };
    img.onerror = () => {
      const defaultImageUrl =
        'https://st3.depositphotos.com/1767687/16607/v/450/depositphotos_166074422-stock-illustration-default-avatar-profile-icon-grey.jpg';
      this.photo = defaultImageUrl;
    };
    img.src = imageUrl;
  }
}
