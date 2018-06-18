import { getStorageItem } from 'common/utils';
import { CHANGE_LANG_ACTION, INITIAL_STATE } from './constants';

const getDefaultState = () =>
  (getStorageItem('application_settings') && getStorageItem('application_settings').appLanguage) ||
  INITIAL_STATE;

export const langReducer = (state = getDefaultState(), { type, payload }) => {
  switch (type) {
    case CHANGE_LANG_ACTION:
      return payload;
    default:
      return state;
  }
};
