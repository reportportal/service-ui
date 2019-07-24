import { fetchDataAction } from 'controllers/fetch';
import { URLS } from 'common/urls';
import { API_INFO_NAMESPACE, UAT_INFO_NAMESPACE } from './constants';

export const fetchApiInfoAction = () => fetchDataAction(API_INFO_NAMESPACE, true)(URLS.apiInfo());

export const fetchUatInfoAction = () =>
  fetchDataAction(UAT_INFO_NAMESPACE, true)(URLS.uatInfo(), {
    headers: { Authorization: undefined },
  });
