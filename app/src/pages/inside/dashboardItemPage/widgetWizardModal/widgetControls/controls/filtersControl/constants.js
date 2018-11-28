import { ENTITY_NUMBER } from 'components/filterEntities/constants';

export const FILTER_SEARCH_FORM = 'filterSearchForm';
export const FILTER_ADD_FORM = 'FilterAddFrom';

export const FORM_APPEARANCE_MODE_EDIT = 'formAppearanceModeEdit';
export const FORM_APPEARANCE_MODE_ADD = 'formAppearanceModeAdd';

export const getOrdersWithDefault = (column) => [
  { isAsc: false, sortingColumn: column },
  { isAsc: false, sortingColumn: ENTITY_NUMBER },
];
