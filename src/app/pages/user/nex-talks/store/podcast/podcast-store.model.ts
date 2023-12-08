import * as Plyr from 'plyr';
import { PodcastDTO } from 'src/app/core/dtos/nex-talk/podcast.dto';
import { SerieDTO } from 'src/app/core/dtos/nex-talk/serie.dto';

export interface PodcastStoreModel {
  currentPage: string;
  currentSerieTypePlaying: string;
  currentIndexSerieToPlay: number;
  currentIndexPodcastToPlay: number;
  selectedPodcastToPlay: PodcastDTO | undefined;
  selectedSerieToPlay: SerieDTO | undefined;
  currentPlayingPodcastList: PodcastDTO[];
  serieList: SerieDTO[];
  serieLastReleaseList: SerieDTO[];
  serieUserList: SerieDTO[];
  serieDetail: SerieDTO | undefined;
  playCount: number;
  isStillPlaying: boolean;
  podcastLastRelease: PodcastDTO[];
  podcastRecentlyPlay: PodcastDTO[];
  podcastLiked: PodcastDTO[];
  serieCreatorList: SerieDTO[];
  podcastCreatorList: PodcastDTO[];
}
