import { PodcastStoreModel } from './podcast-store.model';

export const initialState: PodcastStoreModel = {
  currentPage: '',
  currentSerieTypePlaying: '',
  currentIndexSerieToPlay: 0,
  currentPlayingPodcastList: [],
  currentIndexPodcastToPlay: 0,
  selectedPodcastToPlay: undefined,
  selectedSerieToPlay: undefined,
  serieList: [],
  serieLastReleaseList: [],
  serieUserList: [],
  serieDetail: undefined,
  playCount: 0,
  isStillPlaying: false,
  podcastLastRelease: [],
  podcastRecentlyPlay: [],
  podcastLiked: [],
  serieCreatorList: [],
  podcastCreatorList: [],
};
