import { extractNamespacedQuery } from 'common/utils/breadcrumbsUtils';
import { DEFAULT_PAGINATION } from 'controllers/pagination';
import { SORTING_KEY } from 'controllers/sorting';
import { pageNames, NO_PAGE } from './constants';

export const payloadSelector = (state) => state.location.payload;

export const activeDashboardIdSelector = (state) => payloadSelector(state).dashboardId;
export const projectIdSelector = (state) => payloadSelector(state).projectId;
export const launchIdSelector = (state) => payloadSelector(state).launchId;
export const suiteIdSelector = (state) => payloadSelector(state).suiteId;
export const testItemIdsSelector = (state) =>
  state.location.payload.testItemIds && String(payloadSelector(state).testItemIds);
export const testItemIdsArraySelector = (state) =>
  state.location.payload.testItemIds && String(payloadSelector(state).testItemIds).split('/');

export const pageSelector = (state) => pageNames[state.location.type] || NO_PAGE;

export const pagePropertiesSelector = ({ location: { query } }, namespace, mapping = undefined) => {
  if (!query) {
    return {};
  }

  const extractedQuery = namespace ? extractNamespacedQuery(query, namespace) : query;

  if (!mapping) {
    return extractedQuery;
  }

  const result = {};
  Object.keys(mapping).forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(extractedQuery, key)) {
      const propertyName = mapping[key];
      result[propertyName] = extractedQuery[key];
    }
  });
  return result;
};

export const createQueryParametersSelector = ({
  namespace: staticNamespace,
  defaultPagination,
  defaultSorting,
}) => (state, namespace) => {
  const query = pagePropertiesSelector(state, staticNamespace || namespace);
  return {
    ...(defaultPagination || DEFAULT_PAGINATION),
    [SORTING_KEY]: defaultSorting || '',
    ...query,
  };
};
