import { Component } from '@angular/core';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { ManageStreamDTO } from './dto/manage-stream.dto';
import {
  faCirclePlay,
  faStar,
  faThumbsUp,
} from '@fortawesome/free-regular-svg-icons';
import { LocalService } from 'src/app/core/services/local/local.service';

@Component({
  selector: 'app-stream-page-manage',
  templateUrl: './stream-page-manage.component.html',
  styleUrls: ['./stream-page-manage.component.css'],
})
export class StreamPageManageComponent {
  faChevronRight = faChevronRight;
  faStar = faStar;
  faCirclePlay = faCirclePlay;
  faThumbsUp = faThumbsUp;

  //Category stream
  streamCategory: ManageStreamDTO[];

  selectedStreamCategory: ManageStreamDTO;

  constructor(private readonly localService: LocalService) {
    this.streamCategory = [
      {
        name: 'Editor Choice',
      },
      {
        name: 'Trending',
      },
      {
        name: 'My Video',
      },
    ];
    this.selectedStreamCategory = this.streamCategory[0];
    const streamCategory = this.localService.getData('stream_category');
    this.onSelectedStreamCategory(streamCategory);
  }

  onSelectedStreamCategory(streamCategory: string | null): void {
    if (streamCategory) {
      this.streamCategory.some((category) => {
        if (category.name === streamCategory) {
          this.selectedStreamCategory = category;
          return true;
        }
        return false;
      });
    }
  }

  onChangeStreamCategory(streamCategory: ManageStreamDTO): void {
    this.selectedStreamCategory = streamCategory;
  }
}
