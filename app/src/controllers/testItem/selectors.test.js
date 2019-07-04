import {
  PROJECT_USERDEBUG_TEST_ITEM_LOG_PAGE,
  TEST_ITEM_LOG_PAGE,
  TEST_ITEM_PAGE,
  PROJECT_USERDEBUG_TEST_ITEM_PAGE,
} from 'controllers/pages';
import { logViewLinkSelector, listViewLinkSelector } from './selectors';

const state = {
  launches: {
    debugMode: false,
  },
  location: {
    pathname: '/project1/userdebug/all/1566',
    type: 'PROJECT_USERDEBUG_TEST_ITEM_PAGE',
    payload: {
      projectId: 'project1',
      filterId: 'all',
      testItemIds: '1566/222',
    },
    query: {
      item0Params: 'foo=1',
    },
  },
};

const debugState = {
  launches: {
    debugMode: true,
  },
  location: {
    pathname: '/project1/userdebug/all/1566',
    type: 'PROJECT_USERDEBUG_TEST_ITEM_PAGE',
    payload: {
      projectId: 'project1',
      filterId: 'all',
      testItemIds: '1566/222',
    },
    query: {
      item0Params: 'foo=1',
    },
  },
};

describe('testItem/log/selectors', () => {
  describe('logViewLinkSelector', () => {
    test('it should create a link to the log view', () => {
      expect(logViewLinkSelector(state)).toEqual({
        type: TEST_ITEM_LOG_PAGE,
        payload: {
          projectId: 'project1',
          filterId: 'all',
          testItemIds: '1566/222',
        },
        meta: {
          query: {
            item0Params: 'foo=1',
          },
        },
      });
    });
    test('it should respect debug mode', () => {
      const link = logViewLinkSelector(debugState);
      expect(link).toEqual({
        type: PROJECT_USERDEBUG_TEST_ITEM_LOG_PAGE,
        payload: {
          projectId: 'project1',
          filterId: 'all',
          testItemIds: '1566/222',
        },
        meta: {
          query: {
            item0Params: 'foo=1',
          },
        },
      });
    });
  });
  describe('listViewLinkSelector', () => {
    test('it should create a link to the list view of test item page', () => {
      expect(listViewLinkSelector(state)).toEqual({
        type: TEST_ITEM_PAGE,
        payload: {
          projectId: 'project1',
          filterId: 'all',
          testItemIds: '1566/222',
        },
        meta: {
          query: {
            item0Params: 'foo=1',
          },
        },
      });
    });
    test('it should respect debug mode', () => {
      const link = listViewLinkSelector(debugState);
      expect(link).toEqual({
        type: PROJECT_USERDEBUG_TEST_ITEM_PAGE,
        payload: {
          projectId: 'project1',
          filterId: 'all',
          testItemIds: '1566/222',
        },
        meta: {
          query: {
            item0Params: 'foo=1',
          },
        },
      });
    });
  });
});
