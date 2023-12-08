import { createReducer, on } from '@ngrx/store';
import {
  changeCurrentPage,
  changeCurrentPlayingPodcastList,
  changeIndexPodcastToPlay,
  changeIndexSerieToPlay,
  changePlayCount,
  changePodcastCreatorList,
  changePodcastLastRelease,
  changePodcastLiked,
  changePodcastRecentlyPlay,
  changePodcastToPlay,
  changeSerieCreatorList,
  changeSerieDetail,
  changeSerieLastReleaseList,
  changeSerieList,
  changeSerieToPlay,
  changeSerieTypePlaying,
  changeSerieUserList,
  changeStillPlaying,
  incrementIndexPodcastToPlay,
  resetAllState,
  resetIndexPodcastToPlay,
} from './podcast.actions';
import { initialState } from './podcast.state';

const _podcastReducer = createReducer(
  initialState,
  on(resetAllState, () => initialState),
  on(changeCurrentPage, (state, action) => {
    return {
      ...state,
      currentPage: action.page,
    };
  }),
  //#region ------------- Podcast ------------------
  on(changeStillPlaying, (state, action) => {
    return {
      ...state,
      isStillPlaying: action.status,
    };
  }),
  on(changePlayCount, (state, action) => {
    return {
      ...state,
      playCount: action.count,
    };
  }),
  on(incrementIndexPodcastToPlay, (state) => {
    return {
      ...state,
      currentIndexPodcastToPlay: state.currentIndexPodcastToPlay + 1,
    };
  }),
  on(changeIndexPodcastToPlay, (state, action) => {
    return {
      ...state,
      currentIndexPodcastToPlay: action.index,
    };
  }),
  on(resetIndexPodcastToPlay, (state) => {
    return {
      ...state,
      currentIndexPodcastToPlay: 0,
    };
  }),
  on(changeCurrentPlayingPodcastList, (state, action) => {
    return {
      ...state,
      currentPlayingPodcastList: action.podcastList,
    };
  }),
  on(changePodcastToPlay, (state, action) => {
    return {
      ...state,
      selectedPodcastToPlay: action.selectedPodcastToPlay,
    };
  }),
  on(changePodcastLastRelease, (state, action) => {
    return {
      ...state,
      podcastLastRelease: action.podcastList,
    };
  }),
  on(changePodcastRecentlyPlay, (state, action) => {
    return {
      ...state,
      podcastRecentlyPlay: action.podcastList,
    };
  }),
  on(changePodcastLiked, (state, action) => {
    return {
      ...state,
      podcastLiked: action.podcastList,
    };
  }),
  on(changePodcastCreatorList, (state, action) => {
    return {
      ...state,
      podcastCreatorList: action.podcastList,
    };
  }),
  //#endregion ------------- Podcast ------------------

  //#region ------------- Serie ------------------
  on(changeIndexSerieToPlay, (state, action) => {
    return {
      ...state,
      currentIndexSerieToPlay: action.index,
    };
  }),
  on(changeSerieTypePlaying, (state, action) => {
    return {
      ...state,
      currentSerieTypePlaying: action.serieType,
    };
  }),
  on(changeSerieToPlay, (state, action) => {
    return {
      ...state,
      selectedSerieToPlay: action.selectedSerieToPlay,
    };
  }),
  on(changeSerieList, (state, action) => {
    return {
      ...state,
      serieList: action.serieList,
    };
  }),
  on(changeSerieLastReleaseList, (state, action) => {
    return {
      ...state,
      serieLastReleaseList: action.serieList,
    };
  }),
  on(changeSerieUserList, (state, action) => {
    return {
      ...state,
      serieUserList: action.serieList,
    };
  }),
  on(changeSerieDetail, (state, action) => {
    return {
      ...state,
      serieDetail: action.serie,
    };
  }),
  on(changeSerieCreatorList, (state, action) => {
    return {
      ...state,
      serieCreatorList: action.serieList,
    };
  })
  //#endregion ------------- Serie ------------------
);

export function podcastReducer(state: any, action: any) {
  return _podcastReducer(state, action);
}
