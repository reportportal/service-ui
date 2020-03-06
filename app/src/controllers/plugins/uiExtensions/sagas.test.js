import { runSaga } from 'redux-saga';
import { fetch } from 'common/utils/fetch';
import { fetchUiExtensions } from './sagas';

jest.mock('common/utils/fetch');

fetch.mockImplementation(() => {});

describe('controllers/plugins/uiExtensions/sagas', () => {
  describe('fetchUiExtensions', () => {
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
        fetchUiExtensions,
      ).done;
      expect(fetch).not.toHaveBeenCalled();
    });
    test('should do nothing in case of no plugins with binaryData or getFile command found', async () => {
      const state = {
        user: {
          activeProject: 'testProject',
        },
        plugins: [
          {
            name: 'plugin1',
            enabled: true,
            details: {
              binaryData: {
                main: 'main.js',
              },
            },
          },
          {
            name: 'plugin2',
            enabled: true,
            details: {
              allowedCommands: ['getFile'],
            },
          },
        ],
        integrations: {
          globalIntegrations: [
            {
              id: 123,
              enabled: true,
              integrationType: {
                name: 'plugin1',
                enabled: true,
                details: {
                  binaryData: {
                    main: 'main.js',
                  },
                },
              },
            },
            {
              id: 124,
              enabled: true,
              integrationType: {
                name: 'plugin2',
                enabled: true,
                details: {
                  allowedCommands: ['getFile'],
                },
              },
            },
          ],
        },
      };
      await runSaga(
        {
          getState: () => state,
        },
        fetchUiExtensions,
      ).done;
      expect(fetch).not.toHaveBeenCalled();
    });
    test('should not send response for plugins without global integration', async () => {
      const state = {
        user: {
          activeProject: 'testProject',
        },
        plugins: {
          plugins: [
            {
              name: 'plugin1',
              enabled: true,
              details: {
                binaryData: {
                  main: 'main.js',
                },
              },
            },
            {
              name: 'plugin2',
              enabled: true,
              details: {
                allowedCommands: ['getFile'],
              },
            },
          ],
          integrations: { globalIntegrations: [] },
        },
      };
      await runSaga(
        {
          getState: () => state,
        },
        fetchUiExtensions,
      ).done;
      expect(fetch).not.toHaveBeenCalled();
    });
    test('should not execute getFile command for disabled plugins', async () => {
      const state = {
        user: {
          activeProject: 'testProject',
        },
        plugins: {
          plugins: [
            {
              name: 'plugin1',
              enabled: false,
              details: { binaryData: { main: 'main.js' }, allowedCommands: ['getFile'] },
            },
          ],
          integrations: {
            globalIntegrations: [
              {
                id: 123,
                integrationType: {
                  name: 'plugin1',
                  enabled: false,
                  details: {
                    binaryData: {
                      main: 'main.js',
                    },
                    allowedCommands: ['getFile'],
                  },
                },
              },
            ],
          },
        },
      };
      await runSaga(
        {
          getState: () => state,
        },
        fetchUiExtensions,
      ).done;
      expect(fetch).not.toHaveBeenCalled();
    });
    test('should execute getFile command for plugins with a file', async () => {
      const state = {
        user: {
          activeProject: 'testProject',
        },
        plugins: {
          plugins: [
            {
              name: 'plugin1',
              enabled: true,
              details: { binaryData: { main: 'main.js' }, allowedCommands: ['getFile'] },
            },
            {
              name: 'plugin2',
              enabled: true,
              details: { binaryData: { main: 'main.js' }, allowedCommands: ['getFile'] },
            },
          ],
          integrations: {
            globalIntegrations: [
              {
                id: 123,
                enabled: true,
                integrationType: {
                  name: 'plugin1',
                  enabled: true,
                  details: {
                    binaryData: {
                      main: 'main.js',
                    },
                    allowedCommands: ['getFile'],
                  },
                },
              },
              {
                id: 124,
                enabled: true,
                integrationType: {
                  name: 'plugin2',
                  enabled: true,
                  details: {
                    binaryData: { main: 'main.js' },
                    allowedCommands: ['getFile'],
                  },
                },
              },
            ],
          },
        },
      };
      await runSaga(
        {
          dispatch: () => {},
          getState: () => state,
        },
        fetchUiExtensions,
      ).done;
      expect(fetch).toHaveBeenCalledTimes(2);
      expect(fetch).toHaveBeenCalledWith('/api/v1/integration/testProject/123/getFile', {
        method: 'PUT',
        data: { fileKey: 'main' },
      });
      expect(fetch).toHaveBeenCalledWith('/api/v1/integration/testProject/124/getFile', {
        method: 'PUT',
        data: { fileKey: 'main' },
      });
    });
  });
});
