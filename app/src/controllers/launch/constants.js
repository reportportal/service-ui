import { formatSortingString, SORTING_DESC } from 'controllers/sorting';

export const FETCH_LAUNCHES = 'fetchLaunchesAction';
export const SET_DEBUG_MODE = 'setDebugMode';
export const CHANGE_LAUNCH_DISTINCT = 'changeLaunchDistinct';
export const FETCH_LAUNCHES_WITH_PARAMS = 'fetchLaunchesWithParamsAction';
export const FETCH_LAUNCHES_PAGE_DATA = 'fetchLaunchesPageData';
export const UPDATE_LAUNCH_LOCALLY = 'updateLaunchLocally';

export const NAMESPACE = 'launches';

export const DEFAULT_SORTING = formatSortingString(['startTime', 'number'], SORTING_DESC);
