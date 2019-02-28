import { getStorageItem } from 'common/utils';
import { APPLICATION_SETTINGS } from 'common/constants/localStorageKeys';
import { CHANGE_LANG_ACTION, INITIAL_STATE } from './constants';

const getDefaultState = () =>
  (getStorageItem(APPLICATION_SETTINGS) && getStorageItem(APPLICATION_SETTINGS).appLanguage) ||
  INITIAL_STATE;

export const langReducer = (state = getDefaultState(), { type, payload }) => {
  switch (type) {
    case CHANGE_LANG_ACTION:
      return payload;
    default:
      return state;
  }
};
