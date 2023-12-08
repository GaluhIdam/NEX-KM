import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import {
  faBell,
  faBookOpen,
  faBullhorn,
  faCheck,
  faChevronRight,
  faClock,
  faEllipsis,
  faEllipsisVertical,
  faGear,
  faPenToSquare,
  faPencil,
  faPlus,
  faSearch,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FeedsService } from '../services/feeds.service';
import { tap } from 'rxjs';
import { FeedSourceDTO } from '../dtos/feed.dto';
import { environment } from 'src/environments/environment.prod';
import { NexLearningService } from '../../nex-learning/nex-learning.service';
import { EBookDataService } from 'src/app/core/services/nex-library/ebook-data.service';
import { AlbumDataService } from 'src/app/core/services/nex-library/album-data.service';
import { PodcastDataService } from 'src/app/core/services/nex-talk/podcast-data.service';
import { BaseController } from 'src/app/core/BaseController/base-controller';
import { FeedsService as FeedServiceHome } from '../../home-page/services/feeds.service';
import { SoeService } from 'src/app/core/soe/soe.service';
import { switchMap } from 'rxjs';
import { FeedsDTO } from '../../home-page/dtos/feeds.dto';

@Component({
  selector: 'app-feeds',
  templateUrl: './feeds.component.html',
  styleUrls: ['./feeds.component.css'],
})
export class FeedsComponent extends BaseController implements OnInit, OnDestroy {
  faSearch = faSearch;
  faBookOpen = faBookOpen;
  faBullhorn = faBullhorn;
  faBell = faBell;
  faGear = faGear;
  faPencil = faPencil;
  faPlus = faPlus;
  faCheck = faCheck;
  faXmark = faXmark;
  faChevronRight = faChevronRight;
  faEllipsis = faEllipsis;
  faPenToSquare = faPenToSquare;
  faEllipsisVertical = faEllipsisVertical;
  faClock = faClock;

  isModalOpen: boolean;
  isUnderConstruction: boolean;
  isLoading: boolean = false;

  feeds: FeedSourceDTO[];
  @Input() userPhoto!: string | undefined;
  @Input() personnelTitle!: string | undefined | null;
  @Input() personnelUnit!: string | undefined | null;
  @Input() personnelNumber!: string;
  @Output() totalFeeds = new EventEmitter<number>();

  currentPage: number = 1;
  totalPages: number = 0;

  page: number = 1;
  limit: number = 5;
  search: string = '';
  sortBy: string = 'desc';
  totalData: number = 0;
  pageData: Array<number> = [];
  userName!: string;

  dataFeeds: FeedsDTO[] = []

  mform: FormGroup = new FormGroup({
    search: new FormControl(''),
    page: new FormControl(this.page),
    limit: new FormControl(this.limit),
    sortBy: new FormControl(this.sortBy),
  });

  constructor(private feedsService: FeedsService, private nexLearningService: NexLearningService, private ebookService: EBookDataService, private albumService: AlbumDataService, private podcastService: PodcastDataService, private readonly feedServiceHome: FeedServiceHome,
    private readonly soeService: SoeService) {
    super(FeedsComponent.name);

    this.isModalOpen = false;
    this.isUnderConstruction = false;
    this.feeds = [];
  }

  ngOnInit(): void {
    this.getFeeds(this.personnelNumber)
  }
  ngOnDestroy(): void { }

  getFeeds(personnelNumber: string): void {
    try {
      this.isLoading = true

      this.feedsService.getAllFeeds(personnelNumber)
        .pipe(tap(response => {
          response.data?.hits.map(item => {
            const endPointImg: string = `${environment.apiUrl}/v1/api/file-manager/get-imagepdf`
            let { path, pathCover, pathImage } = item._source

            if (path) item._source.path = `${endPointImg}/${path}`
            else if (pathCover) item._source.pathCover = `${endPointImg}/${pathCover}`
            else if (pathImage) item._source.pathImage = `${endPointImg}/${pathImage}`
          })
        })).subscribe((response) => {
          this.isLoading = false
          this.feeds = response.data?.hits ?? []
          this.totalFeeds.emit(response.data?.total.value)
          // this.totalPages = Math.ceil(response.data?.hits?.length / 9)
        })
    } catch (error) {
      console.error(error);
      this.isLoading = false
      throw error;
    }
  }

  getIndexName(index: string): string {
    let category: string = '';

    if (index.includes('articles')) return category = 'Article'
    else if (index.includes('ebooks')) return category = 'Ebook'
    else if (index.includes('podcast')) return category = 'Podcast'
    else if (index.includes('albums')) return category = 'Album'

    return category
  }

  formatedDate(date: string): string {
    const dateFormated: Date = new Date(date)
    return dateFormated.toLocaleString('id-en', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  publishUnpublish(uuid: string, category: string, status: boolean): void {
    this.isLoading = true;

    try {
      if (category.includes('ebooks')) {
        this.ebookService.updateEbookStatus(uuid, { status })
          .subscribe(response => {
            this.isLoading = false
          })
      }

      if (category.includes('albums')) {
        this.albumService.updateAlbumStatus(uuid, { status })
          .subscribe(response => {
            this.isLoading = false
          })
      }

      if (category.includes('articles')) {
        this.nexLearningService.activeDeadactiveArticle(uuid, status)
          .subscribe((response) => {
            this.isLoading = false
          })
      }

      if (category.includes('podcast')) {
        this.podcastService.updatePodcastStatus(uuid, { status })
          .subscribe(response => {
            this.isLoading = false
          })
      }

      this.ngOnInit()
    } catch (error) {
      console.error(error);
      this.isLoading = false
      throw error
    }
  }

  checkApprovalStatus(status: any): string {
    let approvalStatus: string = '';

    if (['Waiting Approval', null].includes(status)) approvalStatus = 'Waiting Approval'
    if (['Rejected', false].includes(status)) approvalStatus = 'Rejected'
    if (['Approved', true].includes(status)) approvalStatus = 'Approved'

    return approvalStatus
  }

  badge(approvalStatus: string | boolean | null): string {
    let badge: string = '';

    if ((typeof approvalStatus == 'string' || typeof approvalStatus == 'object') && ['Waiting Approval', null].includes(approvalStatus)) badge = 'bg-yellow-500'
    if ((typeof approvalStatus == 'string' || typeof approvalStatus == 'boolean') && ['Rejected', false].includes(approvalStatus)) badge = 'bg-red-500'
    if ((typeof approvalStatus == 'string' || typeof approvalStatus == 'boolean') && ['Approved', true].includes(approvalStatus)) badge = 'bg-green-600'

    return badge
  }

  goToPage(uuid: string, category: string, approvalStatus: string): string | null {
    let url: string = '';

    const status: string = this.checkApprovalStatus(approvalStatus)
    if (['Waiting Approval', 'Rejected'].includes(status)) return null

    if (category.includes('ebooks')) url = `/user/nex-library/ebook/${uuid}`
    if (category.includes('albums')) url = `/user/nex-library/album/${uuid}`
    else if (category.includes('articles')) url = `/user/nex-learning/article/${uuid}`
    else if (category.includes('podcast')) url = `/user/nex-talks/podcast/my-podcast`

    return url
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

  // get history point
  // async getHistoryPointByPersonalNumber(
  //   page: number,
  //   limit: number,
  //   search: string,
  //   sortBy: string,
  //   personalNumber: string,
  // ): Promise<void> {
  //   this.feedServiceHome
  //     .getFeedsByPersonalNumber(page, limit, search, sortBy, personalNumber)
  //     .subscribe((response) => {
  //       this.dataFeeds = response.data.result;
  //       this.totalData = response.data.total;
  //       this.paginate(this.totalData, this.limit, this.pageData);
  //     });
  // }

  // Modal Post
  openPostModal() {
    this.isModalOpen = true;
  }
  closePostModal() {
    this.isModalOpen = false;
  }
}
