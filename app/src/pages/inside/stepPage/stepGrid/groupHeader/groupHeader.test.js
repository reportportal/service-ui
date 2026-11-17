/*
 * Copyright 2026 EPAM Systems
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

import { mapStateToProps } from './groupHeader';

const createState = ({ searchedItems = {}, testItemIds } = {}) => ({
  location: {
    payload: {
      filterId: 'all',
      organizationSlug: 'org',
      projectSlug: 'proj',
      testItemIds,
    },
  },
  testItem: {
    searchedItems,
  },
  user: {
    activeProject: {},
  },
});

describe('GroupHeader mapStateToProps', () => {
  test('sets isSearchedItems when Test Case Search widget has results', () => {
    const state = createState({
      searchedItems: {
        'widget-1': { content: [{ id: 1 }] },
      },
    });

    expect(mapStateToProps(state).isSearchedItems).toBe(true);
  });

  test('sets isSearchedItems to false when search widget has no results', () => {
    expect(mapStateToProps(createState()).isSearchedItems).toBe(false);
  });
});
