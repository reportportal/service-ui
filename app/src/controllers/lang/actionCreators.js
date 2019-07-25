import { CHANGE_LANG_ACTION } from './constants';

export const setLangAction = (lang) => ({
  type: CHANGE_LANG_ACTION,
  payload: lang,
});
