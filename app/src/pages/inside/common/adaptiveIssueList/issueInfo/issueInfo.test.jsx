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
import { fetch } from 'common/utils/fetch';
import { userRolesSelector } from 'controllers/pages';
import { IssueInfo } from './issueInfo';

jest.mock('common/utils/fetch', () => ({
  ...jest.requireActual('common/utils/fetch'),
  fetch: jest.fn(),
}));

jest.mock('controllers/pages', () => ({
  ...jest.requireActual('controllers/pages'),
  userRolesSelector: jest.fn(),
}));

jest.mock('@reportportal/ui-kit', () => ({ BubblesLoader: () => null }));

const VIEWER = { userRole: 'USER', organizationRole: 'MEMBER', projectRole: 'VIEWER' };
const EDITOR = { userRole: 'USER', organizationRole: 'MEMBER', projectRole: 'EDITOR' };
const ISSUE = {
  ticketId: 'BUG-1',
  url: 'https://jira/BUG-1',
  btsProject: 'BUG',
  btsUrl: 'https://jira',
  pluginName: 'jira',
};

const render = () =>
  mount(
    <Provider store={createStore(() => ({ project: { info: { projectKey: 'demo', id: 1 } } }))}>
      <IntlProvider locale="en" onError={() => {}}>
        <IssueInfo issue={ISSUE} />
      </IntlProvider>
    </Provider>,
  );

const flush = () => act(() => new Promise((resolve) => setTimeout(resolve, 0)));

describe('IssueInfo', () => {
  beforeEach(() => {
    localStorage.clear();
    fetch.mockReset();
  });

  test('shows a neutral state to a project viewer without requesting the plugin', () => {
    userRolesSelector.mockReturnValue(VIEWER);
    const wrapper = render();

    expect(fetch).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain('Issue details unavailable');
  });

  test('shows a neutral state on 403 and does not repeat the request on the next hover', async () => {
    userRolesSelector.mockReturnValue(EDITOR);
    fetch.mockRejectedValue({ errorCode: 4003, message: 'Forbidden' });
    const wrapper = render();
    await flush();
    wrapper.update();

    expect(wrapper.text()).toContain('Issue details unavailable');
    expect(wrapper.text()).not.toContain('Issue not found');

    const nextHover = render();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(nextHover.text()).toContain('Issue details unavailable');
  });

  test('keeps the not found state for other errors', async () => {
    userRolesSelector.mockReturnValue(EDITOR);
    fetch.mockRejectedValue({ errorCode: 5000, message: 'BTS is down' });
    const wrapper = render();
    await flush();
    wrapper.update();

    expect(wrapper.text()).toContain('Issue not found');
  });
});
