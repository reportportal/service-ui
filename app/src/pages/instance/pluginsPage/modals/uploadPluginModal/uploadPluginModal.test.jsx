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

import { act } from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { IntlProvider } from 'react-intl';
import { fetch } from 'common/utils';
import { SHOW_NOTIFICATION } from 'controllers/notification/constants';
import { FilesDropzone, UploadModalLayout } from 'pages/common/uploadFileControls';
import { UploadPluginModal } from './uploadPluginModal';

jest.mock('common/utils', () => ({
  ...jest.requireActual('common/utils'),
  fetch: jest.fn(),
}));

// what fetch throws for an answer with a JSON body: the body itself
const registryError = (errorCode, message) => ({ errorCode, message });

const jar = (name) => ({
  file: new File(['jar'], name, { type: 'application/java-archive' }),
  valid: true,
  id: name,
  isLoading: false,
  uploaded: false,
  uploadingProgress: 0,
});

const render = (plugins = []) => {
  const dispatched = [];
  const initial = { plugins: { plugins } };
  const store = createStore((state = initial, action) => {
    dispatched.push(action);
    return state;
  });
  const wrapper = mount(
    <Provider store={store}>
      <IntlProvider locale="en" onError={() => {}}>
        <UploadPluginModal data={{ onImport: () => {} }} />
      </IntlProvider>
    </Provider>,
  );

  const attach = (name) => {
    act(() => {
      wrapper.find(FilesDropzone).prop('addFiles')([jar(name)]);
    });
    wrapper.update();
  };
  const remove = (name) => {
    act(() => {
      wrapper.find(FilesDropzone).prop('removeFile')(name);
    });
    wrapper.update();
  };
  const upload = async () => {
    await act(async () => {
      await wrapper.find(UploadModalLayout).prop('onSave')();
    });
    wrapper.update();
  };
  const find = (id) => wrapper.find(`[data-automation-id="${id}"]`);
  const of = (type) => dispatched.filter((action) => action.type === type);

  return { wrapper, attach, remove, upload, find, of };
};

describe('UploadPluginModal', () => {
  afterEach(() => {
    fetch.mockReset();
  });

  // The instance answers a duplicate with PLUGIN_UPLOAD_ERROR 40039 and HTTP 400 — the code it
  // uses for every other upload failure — so the rejection cannot be told apart from any other.
  // The name is what carries it: same plugin, same version, said before anything is sent.
  describe('a version the instance already holds', () => {
    const installedJira = { name: 'jira', details: { version: '5.7.0' } };

    test('the same version is told apart from the plugin merely being installed', () => {
      const { attach, find } = render([installedJira]);

      attach('jira-5.7.0.jar');

      expect(find('uploadVersionExistsMessage').first().text()).toContain(
        'This version is already installed',
      );
      // the weaker warning is not stacked on top of the stronger one
      expect(find('uploadReplaceExistingMessage')).toHaveLength(0);
    });

    test('a different version of the same plugin is a replacement, not a duplicate', () => {
      const { attach, find } = render([installedJira]);

      attach('jira-5.8.0.jar');

      expect(find('uploadVersionExistsMessage')).toHaveLength(0);
      expect(find('uploadReplaceExistingMessage')).not.toHaveLength(0);
    });

    test('it is said before anything is sent, not after the server refuses', async () => {
      const { attach, find, of } = render([installedJira]);

      attach('jira-5.7.0.jar');

      expect(find('uploadVersionExistsMessage')).not.toHaveLength(0);
      expect(fetch).not.toHaveBeenCalled();
      expect(of(SHOW_NOTIFICATION)).toHaveLength(0);
    });

    test('an installed plugin whose version nobody recorded says nothing about versions', () => {
      const { attach, find } = render([{ name: 'jira', details: {} }]);

      attach('jira-5.7.0.jar');

      expect(find('uploadVersionExistsMessage')).toHaveLength(0);
    });

    test('dropping the file takes the warning with it', () => {
      const { attach, remove, find } = render([installedJira]);

      attach('jira-5.7.0.jar');
      remove('jira-5.7.0.jar');

      expect(find('uploadVersionExistsMessage')).toHaveLength(0);
    });

    test('a failure the instance sent still keeps the generic notification', async () => {
      fetch.mockRejectedValue(registryError('INTERNAL_ERROR', 'Unexpected server error'));
      const { attach, upload, of } = render();

      attach('jira-5.7.0.jar');
      await upload();

      expect(of(SHOW_NOTIFICATION).pop().payload.message).toBe('Unexpected server error');
    });
  });

  describe('a plugin that is already installed', () => {
    const installed = [{ name: 'jira', enabled: true }];

    // the upload replaces what is installed now, and says so before the admin commits to it
    test('the consequence is stated while the file is still only attached', () => {
      const { attach, find } = render(installed);

      attach('jira-5.7.0.jar');

      expect(find('uploadReplaceExistingMessage').first().text()).toContain(
        'This plugin is already installed',
      );
    });

    test('a warning, not a block: the upload is still offered', () => {
      const { wrapper, attach } = render(installed);

      attach('jira-5.7.0.jar');
      const uploadButton = wrapper.find('button').filterWhere((node) => node.text() === 'Upload');

      expect(uploadButton).toHaveLength(1);
      expect(uploadButton.prop('disabled')).toBeFalsy();
    });

    test('a jar for a plugin nothing is installed under stays silent', () => {
      const { attach, find } = render(installed);

      attach('slack-1.0.0.jar');

      expect(find('uploadReplaceExistingMessage')).toHaveLength(0);
    });

    // 'jira' must not claim a file belonging to 'jira-cloud'
    test('the name matches on a whole plugin id, not a prefix of one', () => {
      const { attach, find } = render([{ name: 'jira' }]);

      attach('jiralytics-2.0.jar');

      expect(find('uploadReplaceExistingMessage')).toHaveLength(0);
    });

    test('the warning goes once the file has been sent', async () => {
      fetch.mockResolvedValue({});
      const { attach, upload, find } = render(installed);

      attach('jira-5.7.0.jar');
      await upload();

      expect(find('uploadReplaceExistingMessage')).toHaveLength(0);
    });
  });
});
