import { formatSortingString, SORTING_DESC } from 'controllers/sorting';
import { ENTITY_CREATION_DATE } from 'components/filterEntities/constants';

export const FETCH_EVENTS = 'fetchEvents';
export const NAMESPACE = 'events';
export const DEFAULT_PAGE_SIZE = 50;
export const DEFAULT_SORTING = formatSortingString([ENTITY_CREATION_DATE], SORTING_DESC);
