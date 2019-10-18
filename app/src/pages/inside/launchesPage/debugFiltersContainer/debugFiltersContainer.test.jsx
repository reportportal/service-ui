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

import { mount } from 'enzyme/build';
import { ENTITY_NUMBER } from 'components/filterEntities/constants';
import { formatSortingString, SORTING_ASC, SORTING_DESC, SORTING_KEY } from 'controllers/sorting';
import { createFilterQuery } from 'components/filterEntities/containers/utils';
import { DebugFiltersContainer } from './debugFiltersContainer';

jest.useFakeTimers();

describe('DebugFiltersContainer', () => {
  test('should call passed render function', () => {
    const render = jest.fn(() => <div />);
    mount(<DebugFiltersContainer render={render} />);
    expect(render).toHaveBeenCalledTimes(1);
  });
  test('render function should receive passed props', () => {
    const render = jest.fn(() => <div />);
    mount(<DebugFiltersContainer foo="bar" render={render} />);
    expect(render.mock.calls[0][0]).toHaveProperty('foo', 'bar');
  });
  test('render function should receive filtering and sorting conditions', () => {
    const render = jest.fn(() => <div />);
    const localSorting = { sortingColumn: 'startTime', sortingDirection: SORTING_DESC };
    const localFilter = {};
    mount(
      <DebugFiltersContainer
        localSorting={localSorting}
        localFilter={localFilter}
        render={render}
      />,
    );
    expect(render).toHaveBeenCalledWith(
      expect.objectContaining({
        activeFilterConditions: {},
        sortingColumn: 'startTime',
        sortingDirection: SORTING_DESC,
        onChangeFilter: expect.any(Function),
        onChangeSorting: expect.any(Function),
      }),
    );
  });
  test('should react on changing sorting column', () => {
    const render = jest.fn(() => <div />);
    const fetchAction = jest.fn();
    const updateLocalSorting = jest.fn();
    const localSorting = { sortingColumn: 'startTime', sortingDirection: SORTING_DESC };
    mount(
      <DebugFiltersContainer
        localSorting={localSorting}
        updateLocalSorting={updateLocalSorting}
        fetchLaunchesWithParams={fetchAction}
        render={render}
      />,
    );
    const onChangeSorting = render.mock.calls[0][0].onChangeSorting;
    onChangeSorting('foo');
    expect(fetchAction).toHaveBeenCalled();
    expect(fetchAction).toHaveBeenCalledWith(
      expect.objectContaining({
        [SORTING_KEY]: formatSortingString(['foo', ENTITY_NUMBER], SORTING_ASC),
      }),
    );
    expect(updateLocalSorting).toHaveBeenLastCalledWith(
      expect.objectContaining({
        sortingColumn: 'foo',
        sortingDirection: SORTING_ASC,
      }),
    );
  });
  test('should react on changing sorting direction', () => {
    const render = jest.fn(() => <div />);
    const fetchAction = jest.fn();
    const localSorting = { sortingColumn: 'startTime', sortingDirection: SORTING_DESC };
    const updateLocalSorting = jest.fn();
    mount(
      <DebugFiltersContainer
        localSorting={localSorting}
        updateLocalSorting={updateLocalSorting}
        fetchLaunchesWithParams={fetchAction}
        render={render}
      />,
    );
    const onChangeSorting = render.mock.calls[0][0].onChangeSorting;
    const sortingColumn = render.mock.calls[0][0].sortingColumn;
    onChangeSorting(sortingColumn);
    expect(fetchAction).toHaveBeenCalled();
    expect(fetchAction).toHaveBeenCalledWith(
      expect.objectContaining({
        [SORTING_KEY]: formatSortingString([sortingColumn, ENTITY_NUMBER], SORTING_ASC),
      }),
    );
    expect(updateLocalSorting).toHaveBeenLastCalledWith(
      expect.objectContaining({
        sortingColumn,
        sortingDirection: SORTING_ASC,
      }),
    );
  });
  test('should react on filter change', () => {
    const render = jest.fn(() => <div />);
    const fetchAction = jest.fn();
    const updateDebugLocalFilter = jest.fn();
    const localFilter = {};
    const localSorting = { sortingColumn: 'startTime', sortingDirection: SORTING_DESC };
    mount(
      <DebugFiltersContainer
        localFilter={localFilter}
        localSorting={localSorting}
        updateDebugLocalFilter={updateDebugLocalFilter}
        fetchLaunchesWithParams={fetchAction}
        render={render}
      />,
    );
    const onChangeFilter = render.mock.calls[0][0].onChangeFilter;
    const filterConditions = {
      name: {
        value: 'foo',
        condition: 'cnt',
      },
    };
    onChangeFilter(filterConditions);
    jest.runAllTimers();
    expect(fetchAction).toHaveBeenCalled();
    expect(fetchAction).toHaveBeenCalledWith(
      expect.objectContaining({
        [SORTING_KEY]: formatSortingString(['startTime', ENTITY_NUMBER], SORTING_DESC),
        ...createFilterQuery(filterConditions),
      }),
    );
    expect(updateDebugLocalFilter).toHaveBeenLastCalledWith(filterConditions);
  });
});
