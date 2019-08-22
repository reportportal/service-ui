import { formatSortingString, SORTING_DESC } from 'controllers/sorting';
import { ENTITY_START_TIME } from 'components/filterEntities/constants';

export const FETCH_LAUNCHES = 'fetchLaunchesAction';
export const SET_DEBUG_MODE = 'setDebugMode';
export const CHANGE_LAUNCH_DISTINCT = 'changeLaunchDistinct';
export const FETCH_LAUNCHES_WITH_PARAMS = 'fetchLaunchesWithParamsAction';
export const FETCH_LAUNCHES_PAGE_DATA = 'fetchLaunchesPageData';
export const UPDATE_LAUNCH_LOCALLY = 'updateLaunchLocally';
export const UPDATE_LAUNCHES_LOCALLY = 'updateLaunchesLocally';

export const NAMESPACE = 'launches';

export const DEFAULT_SORTING = formatSortingString([ENTITY_START_TIME, 'number'], SORTING_DESC);
export const DEFAULT_LOCAL_SORTING = {
  sortingColumn: ENTITY_START_TIME,
  sortingDirection: SORTING_DESC,
};

export const UPDATE_LOCAL_SORTING = 'updateLocalSorting';
