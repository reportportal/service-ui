import { runSaga } from 'redux-saga';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { SET_ACTIVE_ORGANIZATION } from 'controllers/organization/constants';
import { deleteOrganization } from './sagas';

jest.mock('common/utils', () => ({
  fetch: jest.fn(),
}));

const organizationState = (activeOrganization) => ({
  organizations: {
    organization: {
      activeOrganization,
    },
  },
});

describe('controllers/instance/organizations/sagas', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  describe('deleteOrganization', () => {
    test('should clear active organization when the deleted organization is active', async () => {
      const organizationId = 23;
      const onSuccess = jest.fn();
      const dispatched = [];

      fetch.mockResolvedValue({});

      await runSaga(
        {
          dispatch: (action) => dispatched.push(action),
          getState: () => organizationState({ id: organizationId, slug: 'test' }),
        },
        deleteOrganization,
        { payload: { organizationId, onSuccess } },
      ).done;

      expect(fetch).toHaveBeenCalledWith(URLS.organizationById(organizationId), {
        method: 'delete',
      });
      expect(dispatched).toHaveLength(2);
      expect(dispatched[0]).toEqual({
        type: SET_ACTIVE_ORGANIZATION,
        payload: null,
      });
      expect(dispatched[1].payload.messageId).toBe('deleteOrganizationSuccess');
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });

    test('should keep active organization when another organization is deleted', async () => {
      const onSuccess = jest.fn();
      const dispatched = [];

      fetch.mockResolvedValue({});

      await runSaga(
        {
          dispatch: (action) => dispatched.push(action),
          getState: () => organizationState({ id: 23, slug: 'test' }),
        },
        deleteOrganization,
        { payload: { organizationId: 24, onSuccess } },
      ).done;

      expect(dispatched).toHaveLength(1);
      expect(dispatched[0].payload.messageId).toBe('deleteOrganizationSuccess');
      expect(onSuccess).toHaveBeenCalledTimes(1);
    });
  });
});
