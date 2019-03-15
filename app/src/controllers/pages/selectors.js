import { createSelector } from 'reselect';
import { extractNamespacedQuery } from 'common/utils/routingUtils';
import { DEFAULT_PAGINATION } from 'controllers/pagination';
import { SORTING_KEY } from 'controllers/sorting';
import { ALL } from 'common/constants/reservedFilterIds';
import { pageNames, NO_PAGE } from './constants';

export const payloadSelector = (state) => state.location.payload || {};

export const activeDashboardIdSelector = (state) => payloadSelector(state).dashboardId;
export const projectIdSelector = (state) => payloadSelector(state).projectId;
export const suiteIdSelector = (state) => payloadSelector(state).suiteId;
export const filterIdSelector = (state) => payloadSelector(state).filterId || ALL;
export const testItemIdsSelector = (state) =>
  payloadSelector(state).testItemIds && String(payloadSelector(state).testItemIds);
export const testItemIdsArraySelector = createSelector(
  testItemIdsSelector,
  (itemIdsString) => (itemIdsString && itemIdsString.split('/').map((item) => Number(item))) || [],
);
export const logItemIdSelector = createSelector(
  testItemIdsArraySelector,
  (itemIdsArray) => Number(itemIdsArray.length && itemIdsArray[itemIdsArray.length - 1]) || 0,
);

export const settingsTabSelector = (state) => payloadSelector(state).settingsTab;

export const pageSelector = (state) => pageNames[state.location.type] || NO_PAGE;
export const projectSectionSelector = (state) => payloadSelector(state).projectSection || '';

const commonPagePropertiesSelector = (query, namespace, mapping = undefined) => {
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

export const pagePropertiesSelector = ({ location: { query } }, namespace, mapping) =>
  commonPagePropertiesSelector(query, namespace, mapping);

export const prevPagePropertiesSelector = (
  {
    location: {
      prev: { query },
    },
  },
  namespace,
  mapping,
) => commonPagePropertiesSelector(query, namespace, mapping);

export const createQueryParametersSelector = ({
  namespace: staticNamespace,
  defaultPagination,
  defaultSorting,
} = {}) => (state, namespace) => {
  const query = pagePropertiesSelector(state, staticNamespace || namespace);
  return {
    ...(defaultPagination || DEFAULT_PAGINATION),
    [SORTING_KEY]: defaultSorting || '',
    ...query,
  };
};

export const launchIdSelector = (state) => {
  const testItemIds = testItemIdsArraySelector(state);
  return testItemIds && testItemIds[0];
};

export const pathnameChangedSelector = (state) => {
  const pathName = state.location.pathname;
  const prevPathName = state.location.prev.pathname;
  return pathName !== prevPathName;
};
