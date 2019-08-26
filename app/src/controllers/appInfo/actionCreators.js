import { fetchDataAction } from 'controllers/fetch';
import { URLS } from 'common/urls';
import { APP_INFO_NAMESPACE } from './constants';

export const fetchAppInfoAction = () =>
  fetchDataAction(APP_INFO_NAMESPACE, true)(URLS.appInfo(), {
    headers: { Authorization: undefined },
  });
