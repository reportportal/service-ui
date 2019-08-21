import { fetchDataAction } from 'controllers/fetch';
import { URLS } from 'common/urls';
import { API_INFO_NAMESPACE, COMPOSITE_INFO_NAMESPACE } from './constants';

export const fetchApiInfoAction = () => fetchDataAction(API_INFO_NAMESPACE, true)(URLS.apiInfo());

export const fetchCompositeInfoAction = () =>
  fetchDataAction(COMPOSITE_INFO_NAMESPACE, true)(URLS.compositeInfo(), {
    headers: { Authorization: undefined },
  });
