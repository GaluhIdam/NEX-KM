import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { NexLearningService } from '../../nex-learning.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { PlyrComponent } from 'ngx-plyr';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { StoryDTO, WatchStoryDTO } from '../../dtos/story.dto';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { tap } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-story-view',
  templateUrl: './story-view.component.html',
  styleUrls: ['./story-view.component.css'],
})
export class StoryViewComponent
  extends BaseController
  implements OnInit, OnDestroy {
  constructor(
    private readonly activeRoute: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private readonly keycloakService: KeycloakService,
    private readonly nexLearningService: NexLearningService
  ) {
    super(StoryViewComponent.name);
  }

  load: boolean = true;

  viewers!: number;

  inspiStory: Array<StoryDTO> = [];
  photo!: string;
  storyData!: StoryDTO;
  personalName!: string;
  //Carousel Option
  customOptionsOne: OwlOptions = {
    margin: 20,
    stagePadding: 10,
    autoplay: true,
    autoplayTimeout: 2000,
    autoplayHoverPause: false,
    loop: true,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: true,
    navSpeed: 600,
    navText: ['&#8249;', '&#8250;'],
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 1,
      },
      720: {
        items: 4,
      },
      1000: {
        items: 4,
      },
    },
    nav: false,
  };

  ngOnDestroy(): void { }
  ngOnInit(): void {
    this.activeRoute.params.subscribe((params: Params) => {
      const uuid = params['uuid'];
      this.getStoryId(uuid);
    });
  }

  photo_default: string =
    'https://st3.depositphotos.com/1767687/16607/v/450/depositphotos_166074422-stock-illustration-default-avatar-profile-icon-grey.jpg';

  //Get Story
  async getStoryId(uuid: string): Promise<void> {
    this.nexLearningService
      .getStoryById(uuid)
      .pipe(
        tap((response) => {
          if (response.data) {
            response.data.path =
              environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' +
              response.data.path;
            response.data.cover = environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' + response.data.cover;
          }
        })
      )
      .subscribe(async (data) => {
        this.nexLearningService
          .getUser(data.data.personalNumber)
          .subscribe((dtx) => {
            this.checkphoto(data.data.personalNumber);
            this.personalName = dtx.personalName;
            this.storyData = data.data;
            this.viewers = data.data.view;
            this.getStoryInspirational(1, 10, '', 'Inspirational', 'trending');
          });
      });
  }

  // get the component instance to have access to plyr instance
  @ViewChild(PlyrComponent, { static: true })
  plyr!: PlyrComponent;
  player!: Plyr;
  youtubeSources = [
    {
      src: 'https://youtube.com/watch?v=bTqVqk7FSmY',
      provider: 'youtube',
    },
  ];

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
          response.data.result.forEach((image) => {
            image.path =
              environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' + image.path
            image.cover = environment.httpUrl +
              '/v1/api/file-manager/get-imagepdf/' + image.cover
          });
        })
      )
      .subscribe((data) => {
        this.inspiStory = data.data.result;
        this.load = false;
      });
  }

  //Decode HTML
  getSanitizedHTML(htmlString: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(htmlString);
  }

  //Check Photo
  private checkphoto(personal_number: string) {
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

  videoSources: Plyr.Source[] = [
    {
      src: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-576p.mp4',
      type: 'video/mp4',
      size: 576,
    },
  ];

  played(event: Plyr.PlyrEvent) {
    this.addView(
      this.storyData.uuid,
      this.keycloakService.getUsername(),
      this.storyData.id
    );
  }

  play(): void {
    this.player.play(); // or this.plyr.player.play()
  }

  pause(): void {
    this.player.pause(); // or this.plyr.player.play()
  }

  stop(): void {
    this.player.stop(); // or this.plyr.player.stop()
  }

  //Add View
  async addView(
    uuid: string,
    personalNumber: string,
    storyId: number
  ): Promise<void> {
    const dto: WatchStoryDTO = {
      personalNumber: personalNumber,
      storyId: storyId,
    };
    this.nexLearningService
      .watchStory(uuid, personalNumber, storyId, dto)
      .subscribe((response) => {
        this.viewers = response.data.view;
      });
  }
}
