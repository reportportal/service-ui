import { UPDATE_FILTER_CONDITIONS } from './constants';
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

    test('should update entities in filter on UPDATE_FILTER_CONDITIONS', () => {
      const oldState = [
        {
          id: '0',
          conditions: [
            {
              value: 'foo',
            },
          ],
        },
        {
          id: '1',
          conditions: [
            {
              value: 'bar',
            },
          ],
        },
      ];
      const newState = launchesFiltersReducer(oldState, {
        type: UPDATE_FILTER_CONDITIONS,
        payload: {
          filterId: '1',
          conditions: [
            {
              value: 'baz',
            },
          ],
        },
      });
      expect(newState).toEqual([
        {
          id: '0',
          conditions: [
            {
              value: 'foo',
            },
          ],
        },
        {
          id: '1',
          conditions: [
            {
              value: 'baz',
            },
          ],
        },
      ]);
    });
  });
});
