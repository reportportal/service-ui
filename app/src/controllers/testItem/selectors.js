import { createSelector } from 'reselect';
import {
  testItemIdsArraySelector,
  createQueryParametersSelector,
  pagePropertiesSelector,
  filterIdSelector,
  TEST_ITEM_PAGE,
  PROJECT_LAUNCHES_PAGE,
} from 'controllers/pages';
import { activeProjectSelector } from 'controllers/user';
import { copyQuery, extractNamespacedQuery } from 'common/utils/routingUtils';
import { NAMESPACE as LAUNCH_NAMESPACE } from 'controllers/launch';
import { DEFAULT_SORTING } from './constants';

const getQueryNamespace = (levelIndex) => `item${levelIndex}`;

const domainSelector = (state) => state.testItem || {};

export const levelSelector = (state) => domainSelector(state).level;
export const loadingSelector = (state) => domainSelector(state).loading;
export const namespaceSelector = (state) =>
  getQueryNamespace(testItemIdsArraySelector(state).length - 1);
export const queryParametersSelector = createQueryParametersSelector({
  defaultSorting: DEFAULT_SORTING,
});
export const parentItemsSelector = (state) => domainSelector(state).parentItems || [];
export const parentItemSelector = (state) => {
  const parentItems = parentItemsSelector(state);
  return parentItems[parentItems.length - 1];
};

const isListView = (query, namespace) => {
  const namespacedQuery = extractNamespacedQuery(query, namespace);
  return namespacedQuery && 'filter.eq.has_childs' in namespacedQuery;
};

export const breadcrumbsSelector = createSelector(
  activeProjectSelector,
  filterIdSelector,
  parentItemsSelector,
  testItemIdsArraySelector,
  pagePropertiesSelector,
  (projectId, filterId, parentItems, testItemIds, query) => {
    const queryNamespacesToCopy = [LAUNCH_NAMESPACE];
    const descriptors = [
      {
        id: filterId,
        title: 'All',
        link: {
          type: PROJECT_LAUNCHES_PAGE,
          payload: {
            projectId,
            filterId,
          },
          meta: {
            query: copyQuery(query, queryNamespacesToCopy),
          },
        },
        active: !testItemIds || testItemIds.length === 0,
      },
    ];
    if (!testItemIds || testItemIds.length === 0) {
      return descriptors;
    }
    return [
      ...descriptors,
      ...parentItems.map((item, i) => {
        queryNamespacesToCopy.push(getQueryNamespace(i));
        return {
          id: item.id,
          title: item.name,
          link: {
            type: TEST_ITEM_PAGE,
            payload: {
              projectId,
              filterId,
              testItemIds: testItemIds && testItemIds.slice(0, i + 1).join('/'),
            },
            meta: {
              query: {
                ...copyQuery(query, queryNamespacesToCopy),
              },
            },
          },
          active: i === parentItems.length - 1,
          listView: isListView(query, getQueryNamespace(i)),
        };
      }),
    ];
  },
);
