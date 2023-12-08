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
import { faPause, faPlay } from '@fortawesome/free-solid-svg-icons';
import * as Plyr from 'plyr';
import { Observable, Subject, takeUntil, tap } from 'rxjs';
import { PodcastDTO } from 'src/app/core/dtos/nex-talk/podcast.dto';
import { PodcastDataService } from 'src/app/core/services/nex-talk/podcast-data.service';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-podcast-latest-release',
  templateUrl: './podcast-latest-release.component.html',
  styleUrls: ['./podcast-latest-release.component.css'],
})
export class PodcastLatestReleaseComponent {
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

  @Input() isPodcastLastReleasePlay!: boolean;
  @Output() isPodcastLastReleasePlayChange = new EventEmitter<boolean>();

  @Input() isPodcastLastPlay!: boolean;
  @Output() isPodcastLastPlayChange = new EventEmitter<boolean>();

  @Input() isPodcastLikedPlay!: boolean;
  @Output() isPodcastLikedPlayChange = new EventEmitter<boolean>();

  onSelectPodcastToPlay(podcast: PodcastDTO | undefined, index: number) {
    if (this.player && podcast) {
      if (this.isPodcastLastPlay) {
        this.isPodcastLastPlayChange.emit(false);
      }

      if (this.isPodcastLikedPlay) {
        this.isPodcastLikedPlayChange.emit(false);
      }

      this.isPodcastLastReleasePlayChange.emit(true);
      if (podcast.isPause) {
        // state for pause state
        this.player.pause();
      } else {
        if (this.selectedPodcastToPlay?.id !== podcast.id) {
          this.podcastLastReleaseData.map((podcast) => {
            podcast.isPause = false;
          });
          podcast.isPause = true;
          this.playCountChange.emit(0);
          this.selectedPodcastToPlayChange.emit(podcast);
          this.podcastLastReleaseDataChange.emit(this.podcastLastReleaseData);
          this.currentIndexPodcastToPlayChange.emit(index);

          this.podcastLastPlayData.map((podcast) => {
            podcast.isPause = false;
          });
          this.podcastLastPlayDataChange.emit(this.podcastLastPlayData);
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
