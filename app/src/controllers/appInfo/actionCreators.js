import { fetchDataAction } from 'controllers/fetch';
import { URLS } from 'common/urls';
import { NAMESPACE } from './constants';

export const fetchInfoAction = () => fetchDataAction(NAMESPACE, true)(URLS.info());
