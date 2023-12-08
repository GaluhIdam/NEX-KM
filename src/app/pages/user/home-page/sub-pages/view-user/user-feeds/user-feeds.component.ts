import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import {
  faEllipsis,
  faGear,
  faPencil,
} from '@fortawesome/free-solid-svg-icons';
import { tap } from 'rxjs';
import { AlbumDataService } from 'src/app/core/services/nex-library/album-data.service';
import { EBookDataService } from 'src/app/core/services/nex-library/ebook-data.service';
import { PodcastDataService } from 'src/app/core/services/nex-talk/podcast-data.service';
import { FeedSourceDTO, QueryParams } from 'src/app/pages/user/dashboard-user/dtos/feed.dto';
import { FeedsService } from 'src/app/pages/user/dashboard-user/services/feeds.service';
import { NexLearningService } from 'src/app/pages/user/nex-learning/nex-learning.service';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-user-feeds',
  templateUrl: './user-feeds.component.html',
  styleUrls: ['./user-feeds.component.css'],
})
export class UserFeedsComponent implements OnInit, OnDestroy {
  faGear = faGear;
  faPencil = faPencil;
  faEllipsis = faEllipsis;

  isModalOpen: boolean;
  isUnderConstruction: boolean;

  isLoading: boolean = false;
  feeds: FeedSourceDTO[];
  personnelNumber!: string;
  @Input() userPhoto!: string | undefined;
  @Input() personnelTitle!: string | undefined | null;
  @Input() personnelUnit!: string | undefined | null;
  @Output() totalFeeds = new EventEmitter<number>();

  constructor(private feedsService: FeedsService, private ebookService: EBookDataService, private albumService: AlbumDataService, private nexLearningService: NexLearningService, private podcastService: PodcastDataService, private route: ActivatedRoute) {
    this.isModalOpen = false;
    this.isUnderConstruction = false;
    this.feeds = [];

    const currentUrl: Params = this.route.snapshot.params
    this.personnelNumber = currentUrl.personal_number
  }

  ngOnInit(): void {
    this.getFeeds(this.personnelNumber)
  }
  ngOnDestroy(): void { }

  getFeeds(personnelNumber: string): void {
    try {
      this.isLoading = true

      let queryParams: QueryParams;
      queryParams = { approvalStatus: 'Approved', approvalStatusBool: true, bannedStatus: false, status: true }

      this.feedsService.getAllFeeds(personnelNumber, queryParams)
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
        })
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  formatedDate(date: string): string {
    const dateFormated: Date = new Date(date)
    return dateFormated.toLocaleString('id-Id', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  getIndexName(index: string): string {
    let category: string = '';

    if (index.includes('articles')) return category = 'Article'
    else if (index.includes('ebooks')) return category = 'Ebook'
    else if (index.includes('podcast')) return category = 'Podcast'
    else if (index.includes('albums')) return category = 'Album'

    return category
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
    } catch (error) {
      console.error(error);
      this.isLoading = false
      throw error
    }
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

  // Modal Post
  openPostModal() {
    this.isModalOpen = true;
  }
  closePostModal() {
    this.isModalOpen = false;
  }
}
