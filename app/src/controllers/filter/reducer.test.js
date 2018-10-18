import { UPDATE_FILTER_ENTITIES } from './constants';
import { launchesFiltersReducer } from './reducer';

describe('filter reducer', () => {
  describe('launchesFiltersReducer', () => {
    test('should return old state in unknown action', () => {
      const oldState = [{ id: 0 }];
      expect(
        launchesFiltersReducer(oldState, {
          type: 'test',
        }),
      ).toBe(oldState);
    });

    test('should update entities in filter on UPDATE_FILTER_ENTITIES', () => {
      const oldState = [
        {
          id: '0',
          entities: [
            {
              value: 'foo',
            },
          ],
        },
        {
          id: '1',
          entities: [
            {
              value: 'bar',
            },
          ],
        },
      ];
      const newState = launchesFiltersReducer(oldState, {
        type: UPDATE_FILTER_ENTITIES,
        payload: {
          filterId: '1',
          entities: [
            {
              value: 'baz',
            },
          ],
        },
      });
      expect(newState).toEqual([
        {
          id: '0',
          entities: [
            {
              value: 'foo',
            },
          ],
        },
        {
          id: '1',
          entities: [
            {
              value: 'baz',
            },
          ],
        },
      ]);
    });
  });
});
