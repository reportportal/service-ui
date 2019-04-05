import { PROJECT_LOG_PAGE, PROJECT_USERDEBUG_LOG_PAGE } from 'controllers/pages';
import { retryLinkSelector } from './selectors';

describe('log/selectors', () => {
  describe('retryLinkSelector', () => {
    test('it should create a link to the log level with retryId in query', () => {
      expect(
        retryLinkSelector.resultFunc(
          { projectId: 'project', filterId: 'all', testItemIds: '1/2/3' },
          { launchParams: 'foo=3' },
          false,
          { testItemId: 5, retryId: 244 },
        ),
      ).toEqual({
        type: PROJECT_LOG_PAGE,
        payload: { projectId: 'project', filterId: 'all', testItemIds: '1/2/3/5' },
        meta: {
          query: {
            launchParams: 'foo=3',
            logParams: 'retryId=244',
          },
        },
      });
    });
    test('it should respect debug mode', () => {
      const link = retryLinkSelector.resultFunc(
        { projectId: 'project', filterId: 'all', testItemIds: '1/2/3' },
        { launchParams: 'foo=3' },
        true,
        5,
      );
      expect(link).toHaveProperty('type', PROJECT_USERDEBUG_LOG_PAGE);
    });
  });
});
