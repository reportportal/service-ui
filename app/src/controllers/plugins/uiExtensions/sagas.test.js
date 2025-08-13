import { runSaga } from 'redux-saga';
import { fetch } from 'common/utils/fetch';
import { fetchExtensionManifestsSuccessAction } from 'controllers/plugins/uiExtensions/actions';
import { fetchExtensionManifests } from './sagas';

jest.mock('common/utils/fetch');
jest.mock('controllers/plugins/uiExtensions/actions');

fetch.mockImplementation(() => Promise.resolve({ name: 'extension1' }));
fetchExtensionManifestsSuccessAction.mockImplementation(() => ({ type: 'test', payload: [] }));

describe('controllers/plugins/uiExtensions/sagas', () => {
  describe('fetchExtensionManifests', () => {
    beforeEach(() => {
      fetch.mockClear();
    });

    test('should do nothing in case no plugins found', async () => {
      const state = {
        plugins: { plugins: [] },
      };
      await runSaga(
        {
          getState: () => state,
        },
        fetchExtensionManifests,
      ).done;
      expect(fetch).not.toHaveBeenCalled();
      expect(fetchExtensionManifestsSuccessAction).not.toHaveBeenCalled();
    });
    test('should do nothing in case of no plugins with binaryData and manifest file found', async () => {
      const state = {
        plugins: {
          plugins: [
            {
              name: 'plugin1',
              enabled: true,
              details: {},
            },
            {
              name: 'plugin2',
              enabled: true,
              details: {
                binaryData: {},
              },
            },
          ],
        },
      };
      await runSaga(
        {
          getState: () => state,
        },
        fetchExtensionManifests,
      ).done;
      expect(fetch).not.toHaveBeenCalled();
      expect(fetchExtensionManifestsSuccessAction).not.toHaveBeenCalled();
    });
    test('should not fetch manifests for disabled plugins', async () => {
      const state = {
        user: {
          activeProjectKey: 'testProject',
        },
        plugins: {
          plugins: [
            {
              name: 'plugin1',
              enabled: false,
              details: { binaryData: { metadata: 'manifest.json' } },
            },
          ],
        },
      };
      await runSaga(
        {
          getState: () => state,
        },
        fetchExtensionManifests,
      ).done;
      expect(fetch).not.toHaveBeenCalled();
      expect(fetchExtensionManifestsSuccessAction).not.toHaveBeenCalled();
    });
    test('should fetch manifests for enabled plugins with manifest file present', async () => {
      const state = {
        plugins: {
          plugins: [
            {
              name: 'plugin1',
              enabled: true,
              details: { binaryData: { metadata: 'manifest.json' } },
            },
            {
              name: 'plugin2',
              enabled: true,
              details: { binaryData: { metadata: 'manifest2.json' } },
            },
          ],
        },
      };
      await runSaga(
        {
          dispatch: () => {},
          getState: () => state,
        },
        fetchExtensionManifests,
      ).done;
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(fetch).toHaveBeenCalledWith('../api/v1/plugin/public/plugin1/file/manifest.json', {
        contentType: 'application/json',
      });
      expect(fetch).toHaveBeenCalledWith('../api/v1/plugin/public/plugin2/file/manifest2.json', {
        contentType: 'application/json',
      });
      expect(fetchExtensionManifestsSuccessAction).toHaveBeenCalledTimes(1);
      expect(fetchExtensionManifestsSuccessAction).toHaveBeenCalledWith([
        { name: 'extension1', pluginName: 'plugin1' },
        { name: 'extension1', pluginName: 'plugin2' },
      ]);
    });
  });
});
