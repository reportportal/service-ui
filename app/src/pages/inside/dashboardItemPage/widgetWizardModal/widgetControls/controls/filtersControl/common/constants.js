import {
  ENTITY_NUMBER,
  ENTITY_NAME,
  CONDITION_CNT,
  ENTITY_START_TIME,
} from 'components/filterEntities/constants';

export const FILTER_SEARCH_FORM = 'filterSearchForm';
export const FILTER_ADD_FORM = 'FilterAddFrom';

export const FORM_APPEARANCE_MODE_EDIT = 'formAppearanceModeEdit';
export const FORM_APPEARANCE_MODE_ADD = 'formAppearanceModeAdd';

export const FILTER_NAME_KEY = 'name';

export const getOrdersWithDefault = (column) => [
  { sortingColumn: column, isAsc: false },
  { sortingColumn: ENTITY_NUMBER, isAsc: false },
];

export const NEW_FILTER_DEFAULT_CONFIG = {
  share: false,
  type: 'launch',
  conditions: [{ filteringField: ENTITY_NAME, value: '', condition: CONDITION_CNT }],
  orders: getOrdersWithDefault(ENTITY_START_TIME),
};
