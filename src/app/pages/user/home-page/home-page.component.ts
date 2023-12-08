import { SliderDTO } from './dtos/sliders.dto';
import { KeycloakService } from 'keycloak-angular';
import { HomePageService } from 'src/app/pages/user/home-page/homepage.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { SoeService } from 'src/app/core/soe/soe.service';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { switchMap, tap } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import { Carousel, initTE } from 'tw-elements';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css'],
})
export class HomePageComponent
  extends BaseController
  implements OnInit, OnDestroy
{
  faChevronRight = faChevronRight;

  constructor(
    private readonly homePageService: HomePageService,
    private readonly keycloakService: KeycloakService,
    private readonly soeService: SoeService,
    private readonly router: Router
  ) {
    super(HomePageComponent.name);
  }

  userName!: string;
  dataSliders: SliderDTO[] = [];

  page: number = 1;
  limit: number = 12;
  search: string = '';
  sortBy: string = 'desc';
  isAdmin!: boolean;

  img!: File;

  //slider
  customOptionsOne: OwlOptions = {
    margin: 20,
    autoplay: false,
    autoplayTimeout: 2000,
    autoplayHoverPause: false,
    loop: false,
    mouseDrag: true,
    touchDrag: true,
    pullDrag: false,
    dots: false,
    navSpeed: 600,
    navText: ['&#8249', '&#8250;'],
    responsive: {
      0: {
        items: 1,
      },
      400: {
        items: 1,
      },
      760: {
        items: 1,
      },
      1000: {
        items: 1,
      },
    },
    nav: true,
  };

  ngOnDestroy(): void {}
  ngOnInit(): void {
    initTE({ Carousel });
    this.getUser(this.keycloakService.getUsername());
    this.getDataSliders(
      this.page,
      this.limit,
      this.search,
      this.sortBy,
      this.isAdmin
    );
  }

  //Get User
  async getUser(personalNumber: string): Promise<void> {
    try {
      this.soeService
        .getUserData(personalNumber)
        .pipe(switchMap((result) => (this.userName = result.personalName)))
        .subscribe();
    } catch (error) {
      throw error;
    }
  }

  async getDataSliders(
    page: number,
    limit: number,
    search: string,
    sortBy: string,
    isAdmin: boolean
  ): Promise<void> {
    try {
      this.homePageService
        .getSliders(page, limit, search, sortBy, isAdmin)
        .pipe(
          tap((data) => {
            if (data.data.result) {
              data.data.result.forEach(
                (dtz) =>
                  (dtz.backgroundImage =
                    environment.httpUrl +
                    '/v1/api/file-manager/get-imagepdf/' +
                    dtz.backgroundImage)
              );
            }
          })
        )
        .subscribe((response) => {
          this.dataSliders = response.data.result;
        });
    } catch (error) {
      throw error;
    }
  }

  onGotoNexLibrary(): void {
    this.router.navigate(['/user/nex-library']);
  }

  onGotoCommunity(): void {
    this.router.navigate(['/user/nex-community']);
  }

  onGotoLearning(): void {
    this.router.navigate(['/user/nex-learning']);
  }

  onGotoNexTalk(): void {
    this.router.navigate(['/user/nex-talks']);
  }

  onGotoNexLevel(): void {
    this.router.navigate(['/user/nex-level']);
  }
}
