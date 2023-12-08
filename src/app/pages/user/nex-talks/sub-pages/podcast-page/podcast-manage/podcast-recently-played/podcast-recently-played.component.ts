import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  faBars,
  faHome,
  faEllipsis,
  faPlay,
  faPause,
} from '@fortawesome/free-solid-svg-icons';
import { PlyrComponent } from 'ngx-plyr';
import * as Plyr from 'plyr';
import { Subject, takeUntil, tap } from 'rxjs';
import { PodcastDTO } from 'src/app/core/dtos/nex-talk/podcast.dto';
import { PodcastDataService } from 'src/app/core/services/nex-talk/podcast-data.service';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-podcast-recently-played',
  templateUrl: './podcast-recently-played.component.html',
  styleUrls: ['./podcast-recently-played.component.css'],
})
export class PodcastRecentlyPlayedComponent {
  faPlay = faPlay;
  faPause = faPause;

  @Input() player: Plyr | undefined;
  @Input() isLoading!: boolean;
  @Input() isDurationLoading!: boolean;

  @Input() playCount!: number;
  @Output() playCountChange = new EventEmitter<number>();

  @Input() selectedPodcastToPlay: PodcastDTO | undefined;
  @Output() selectedPodcastToPlayChange = new EventEmitter<
    PodcastDTO | undefined
  >();

  @Input() currentIndexPodcastToPlay!: number;
  @Output() currentIndexPodcastToPlayChange = new EventEmitter<number>();

  @Input() podcastLastReleaseData!: PodcastDTO[];
  @Output() podcastLastReleaseDataChange = new EventEmitter<PodcastDTO[]>();

  @Input() podcastLastPlayData!: PodcastDTO[];
  @Output() podcastLastPlayDataChange = new EventEmitter<PodcastDTO[]>();

  @Input() likedPodcastData!: PodcastDTO[];
  @Output() likedPodcastDataChange = new EventEmitter<PodcastDTO[]>();

  @Input() isPodcastLastPlay!: boolean;
  @Output() isPodcastLastPlayChange = new EventEmitter<boolean>();

  @Input() isPodcastLastReleasePlay!: boolean;
  @Output() isPodcastLastReleasePlayChange = new EventEmitter<boolean>();

  @Input() isPodcastLikedPlay!: boolean;
  @Output() isPodcastLikedPlayChange = new EventEmitter<boolean>();

  onSelectPodcastToPlay(podcast: PodcastDTO | undefined, index: number) {
    if (this.player && podcast) {
      if (this.isPodcastLastReleasePlay) {
        this.isPodcastLastReleasePlayChange.emit(false);
      }

      if (this.isPodcastLikedPlay) {
        this.isPodcastLikedPlayChange.emit(false);
      }

      this.isPodcastLastPlayChange.emit(true);
      if (podcast.isPause) {
        // state for pause state
        this.player.pause();
      } else {
        if (this.selectedPodcastToPlay?.id !== podcast.id) {
          this.podcastLastPlayData.map((podcast) => {
            podcast.isPause = false;
          });
          podcast.isPause = true;
          this.playCountChange.emit(0);
          this.selectedPodcastToPlayChange.emit(podcast);
          this.podcastLastPlayDataChange.emit(this.podcastLastPlayData);
          this.currentIndexPodcastToPlayChange.emit(index);

          this.podcastLastReleaseData.map((podcast) => {
            podcast.isPause = false;
          });
          this.podcastLastReleaseDataChange.emit(this.podcastLastReleaseData);
          this.likedPodcastData.map((podcast) => {
            podcast.isPause = false;
          });
          this.likedPodcastDataChange.emit(this.likedPodcastData);
        } else {
          //continue play current podcast
          this.player.play();
        }
      }
    }
  }
}
