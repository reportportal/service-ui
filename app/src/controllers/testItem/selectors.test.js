/*
 * Copyright 2019 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  PROJECT_USERDEBUG_LOG_PAGE,
  PROJECT_LOG_PAGE,
  TEST_ITEM_PAGE,
  PROJECT_USERDEBUG_TEST_ITEM_PAGE,
} from 'controllers/pages';
import { logViewLinkSelector, listViewLinkSelector } from './selectors';

describe('testItem/log/selectors', () => {
  describe('logViewLinkSelector', () => {
    const state = {
      launches: {
        debugMode: false,
      },
      location: {
        pathname: '/project1/userdebug/all/1566',
        type: 'TEST_ITEM_PAGE',
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
    test('it should create a link to the log view', () => {
      expect(logViewLinkSelector(state)).toEqual({
        type: PROJECT_LOG_PAGE,
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
        type: PROJECT_USERDEBUG_LOG_PAGE,
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
    const state = {
      launches: {
        debugMode: false,
      },
      location: {
        pathname: '/project1/userdebug/all/1566',
        type: 'PROJECT_LOG_PAGE',
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
        type: 'PROJECT_USERDEBUG_LOG_PAGE',
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
