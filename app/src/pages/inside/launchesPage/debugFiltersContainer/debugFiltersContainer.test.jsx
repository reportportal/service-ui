import { mount } from 'enzyme/build';
import { ENTITY_NUMBER, ENTITY_START_TIME } from 'components/filterEntities/constants';
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
    mount(<DebugFiltersContainer render={render} />);
    expect(render).toHaveBeenCalledWith(
      expect.objectContaining({
        activeFilterConditions: {},
        sortingColumn: ENTITY_START_TIME,
        sortingDirection: SORTING_DESC,
        onChangeFilter: expect.any(Function),
        onChangeSorting: expect.any(Function),
      }),
    );
  });
  test('should react on changing sorting column', () => {
    const render = jest.fn(() => <div />);
    const fetchAction = jest.fn();
    mount(<DebugFiltersContainer fetchLaunchesWithParams={fetchAction} render={render} />);
    const onChangeSorting = render.mock.calls[0][0].onChangeSorting;
    onChangeSorting('foo');
    expect(fetchAction).toHaveBeenCalled();
    expect(fetchAction).toHaveBeenCalledWith(
      expect.objectContaining({
        [SORTING_KEY]: formatSortingString(['foo', ENTITY_NUMBER], SORTING_ASC),
      }),
    );
    expect(render).toHaveBeenCalledTimes(2);
    expect(render).toHaveBeenLastCalledWith(
      expect.objectContaining({
        sortingColumn: 'foo',
        sortingDirection: SORTING_ASC,
      }),
    );
  });
  test('should react on changing sorting direction', () => {
    const render = jest.fn(() => <div />);
    const fetchAction = jest.fn();
    mount(<DebugFiltersContainer fetchLaunchesWithParams={fetchAction} render={render} />);
    const onChangeSorting = render.mock.calls[0][0].onChangeSorting;
    const sortingColumn = render.mock.calls[0][0].sortingColumn;
    onChangeSorting(sortingColumn);
    expect(fetchAction).toHaveBeenCalled();
    expect(fetchAction).toHaveBeenCalledWith(
      expect.objectContaining({
        [SORTING_KEY]: formatSortingString([sortingColumn, ENTITY_NUMBER], SORTING_ASC),
      }),
    );
    expect(render).toHaveBeenCalledTimes(2);
    expect(render).toHaveBeenLastCalledWith(
      expect.objectContaining({
        sortingColumn,
        sortingDirection: SORTING_ASC,
      }),
    );
  });
  test('should react on filter change', () => {
    const render = jest.fn(() => <div />);
    const fetchAction = jest.fn();
    mount(<DebugFiltersContainer fetchLaunchesWithParams={fetchAction} render={render} />);
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
        ...createFilterQuery(filterConditions),
      }),
    );
    expect(render).toHaveBeenCalledTimes(2);
    expect(render).toHaveBeenLastCalledWith(
      expect.objectContaining({
        activeFilterConditions: filterConditions,
      }),
    );
  });
});
