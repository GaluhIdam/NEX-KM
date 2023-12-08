import { PodcastDTO } from 'src/app/core/dtos/nex-talk/podcast.dto';
import { createAction, props } from '@ngrx/store';
import { SerieDTO } from 'src/app/core/dtos/nex-talk/serie.dto';
import * as Plyr from 'plyr';

//#region ------------- Podcast ------------------
export const resetAllState = createAction('resetAllState');

export const changeCurrentPage = createAction(
  'changeCurrentPage',
  props<{ page: string }>()
);

export const changeStillPlaying = createAction(
  'changeStillPlaying',
  props<{ status: boolean }>()
);

export const changePlayCount = createAction(
  'changePlayCount',
  props<{ count: number }>()
);

export const incrementIndexPodcastToPlay = createAction(
  'incrementIndexPodcastToPlay'
);

export const changeIndexPodcastToPlay = createAction(
  'changeIndexPodcastToPlay',
  props<{ index: number }>()
);

export const resetIndexPodcastToPlay = createAction('resetIndexPodcastToPlay');

export const changeCurrentPlayingPodcastList = createAction(
  'changeCurrentPlayingPodcastList',
  props<{ podcastList: PodcastDTO[] }>()
);

export const changePodcastToPlay = createAction(
  'changePodcastToPlay',
  props<{ selectedPodcastToPlay: PodcastDTO }>()
);

export const changePodcastLastRelease = createAction(
  'changePodcastLastRelease',
  props<{ podcastList: PodcastDTO[] }>()
);
export const changePodcastRecentlyPlay = createAction(
  'changePodcastRecentlyPlay',
  props<{ podcastList: PodcastDTO[] }>()
);
export const changePodcastLiked = createAction(
  'changePodcastLiked',
  props<{ podcastList: PodcastDTO[] }>()
);

export const changePodcastCreatorList = createAction(
  'changePodcastCreatorList',
  props<{ podcastList: PodcastDTO[] }>()
);
//#endregion ------------- Podcast ------------------

//#endregion ------------- Serie ------------------
export const changeIndexSerieToPlay = createAction(
  'changeIndexSerieToPlay',
  props<{ index: number }>()
);

export const changeSerieTypePlaying = createAction(
  'changeSerieTypePlaying',
  props<{ serieType: string }>()
);

export const changeSerieToPlay = createAction(
  'changeSerieToPlay',
  props<{ selectedSerieToPlay: SerieDTO }>()
);

export const changeSerieList = createAction(
  'changeSerieList',
  props<{ serieList: SerieDTO[] }>()
);

export const changeSerieLastReleaseList = createAction(
  'changeSerieLastReleaseList',
  props<{ serieList: SerieDTO[] }>()
);

export const changeSerieUserList = createAction(
  'changeSerieUserList',
  props<{ serieList: SerieDTO[] }>()
);

export const changeSerieDetail = createAction(
  'changeSerieDetail',
  props<{ serie: SerieDTO }>()
);

export const changeSerieCreatorList = createAction(
  'changeSerieCreatorList',
  props<{ serieList: SerieDTO[] }>()
);
//#endregion ------------- Serie ------------------
