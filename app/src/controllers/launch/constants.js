import { createSortingString, SORTING_DESC } from 'controllers/sorting';

export const FETCH_LAUNCHES = 'fetchLaunchesAction';

export const NAMESPACE = 'launches';

export const DEFAULT_SORTING = createSortingString(['start_time', 'number'], SORTING_DESC);
