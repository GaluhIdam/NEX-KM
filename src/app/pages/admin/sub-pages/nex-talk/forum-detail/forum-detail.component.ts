import { Component, OnDestroy, OnInit } from '@angular/core';
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
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, Subject, filter, takeUntil, tap } from 'rxjs';
import { ForumDataService } from 'src/app/core/services/nex-talk/forum-data.service';
import { ForumDTO } from 'src/app/core/dtos/nex-talk/forum.dto';
import * as moment from 'moment';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';

@Component({
  selector: 'app-forum-detail',
  templateUrl: './forum-detail.component.html',
  styleUrls: ['./forum-detail.component.css'],
})
export class ForumDetailComponent implements OnInit, OnDestroy {
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
  faTrash = faTrash;

  titlePage: any;

  _onDestroy$: Subject<Boolean> = new Subject<Boolean>();

  //uuid from URL
  uuid: string | null;

  //eBook Detail
  forumDetailData: ForumDTO | undefined;

  isLoading: boolean;
  isError: boolean;

  parsedForumDescription: any;

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly titleService: Title,
    private readonly forumDataService: ForumDataService
  ) {
    const requestUuid = this.activatedRoute.snapshot.paramMap.get('uuid');
    this.uuid = requestUuid;
    this.isLoading = false;
    this.isError = false;
  }

  ngOnInit() {
    this.initTitlePage();
    this.initForumDetail();
  }

  ngOnDestroy(): void {
    this._onDestroy$.next(true);
    this._onDestroy$.unsubscribe();
  }

  initTitlePage(): void {
    this.activatedRoute.data.subscribe((data) => {
      this.titlePage = data;
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

  initForumDetail(): void {
    if (this.uuid) {
      this.isLoading = true;
      this.forumDataService
        .getForumDetailDataByUuid(this.uuid)
        .pipe(
          tap((response) => {
            this.parsedForumDescription = this.parseHTML(
              response.data.description
            );
            console.log(this.parsedForumDescription);
          }),
          takeUntil(this._onDestroy$)
        )
        .subscribe(
          (response) => {
            this.isLoading = false;
            this.forumDetailData = response.data;
          },
          () => {
            this.isLoading = false;
            this.isError = true;
          }
        );
    }
  }

  onDeleteForum(uuid: string): void {
    this.isLoading = true;
    this.forumDataService.deleteForumData(uuid).subscribe(
      (success) => {
        Swal.fire({
          icon: 'success',
          title: 'Great Move..',
          text: 'The Forum has been removed from the list',
        }).then(() => {
          this.isLoading = false;
          this.router.navigate(['/admin/forum']);
        });
      },
      (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Something went wrong!',
        }).then(() => {
          this.isLoading = false;
        });
      }
    );
  }

  formattedDate(date: string): string {
    return moment(date).format('LL');
  }

  parseHTML(htmlString: string): string {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    return doc.body.innerHTML;
  }
}
