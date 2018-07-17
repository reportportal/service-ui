import { createSelector } from 'reselect';
import {
  testItemIdsArraySelector,
  createQueryParametersSelector,
  pagePropertiesSelector,
  filterIdSelector,
  TEST_ITEM_PAGE,
  PROJECT_LAUNCHES_PAGE,
  payloadSelector,
  testItemIdsSelector,
} from 'controllers/pages';
import { activeProjectSelector } from 'controllers/user';
import {
  copyQuery,
  extractNamespacedQuery,
  createNamespacedQuery,
} from 'common/utils/routingUtils';
import { LEVEL_STEP } from 'common/constants/launchLevels';
import { NAMESPACE as LAUNCH_NAMESPACE } from 'controllers/launch';
import { DEFAULT_SORTING } from './constants';
import { createLink, getQueryNamespace, getDefectsString } from './utils';

const domainSelector = (state) => state.testItem || {};

export const levelSelector = (state) => domainSelector(state).level;
export const loadingSelector = (state) => domainSelector(state).loading;
export const pageLoadingSelector = (state) => domainSelector(state).pageLoading;
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
export const launchSelector = (state) => parentItemsSelector(state)[0];
export const isLostLaunchSelector = (state) =>
  parentItemsSelector(state).length > 1 && !!launchSelector(state);

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
        if (!item) {
          return {
            id: testItemIds[i] || i,
            error: true,
            lost: i === 0 && parentItems.length > 1,
          };
        }
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

export const nameLinkSelector = (state, ownProps) => {
  const query = pagePropertiesSelector(state);
  const payload = payloadSelector(state);
  const testItemIds = testItemIdsSelector(state);
  return createLink(testItemIds, ownProps.itemId, payload, query);
};

export const statisticsLinkSelector = (state, ownProps) => {
  const query = pagePropertiesSelector(state);
  const payload = payloadSelector(state);
  const testItemIds = testItemIdsSelector(state);
  return createLink(testItemIds, ownProps.itemId, payload, {
    ...query,
    ...createNamespacedQuery(
      {
        'filter.eq.has_childs': false,
        'filter.in.type': LEVEL_STEP,
        'filter.in.status': ownProps.statuses && ownProps.statuses.join(','),
      },
      getQueryNamespace(
        testItemIdsArraySelector(state) ? testItemIdsArraySelector(state).length : 0,
      ),
    ),
  });
};

export const defectLinkSelector = (state, ownProps) => {
  const query = pagePropertiesSelector(state);
  const payload = payloadSelector(state);
  const testItemIds = testItemIdsSelector(state);
  return createLink(testItemIds, ownProps.itemId, payload, {
    ...query,
    ...createNamespacedQuery(
      {
        'filter.eq.has_childs': false,
        'filter.in.issue$issue_type': getDefectsString(ownProps.defects),
      },
      getQueryNamespace(
        testItemIdsArraySelector(state) ? testItemIdsArraySelector(state).length : 0,
      ),
    ),
  });
};
