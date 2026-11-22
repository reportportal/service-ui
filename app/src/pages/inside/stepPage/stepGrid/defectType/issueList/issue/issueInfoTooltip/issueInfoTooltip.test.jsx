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

import { shallow } from 'enzyme';
import { fetch } from 'common/utils/fetch';
import { IssueInfoTooltip } from './issueInfoTooltip';

jest.mock('common/utils/fetch', () => ({
  ...jest.requireActual('common/utils/fetch'),
  fetch: jest.fn(),
}));

const Tooltip = IssueInfoTooltip.WrappedComponent;
const intl = { formatMessage: ({ defaultMessage }) => defaultMessage };

const render = (props = {}) =>
  shallow(
    <Tooltip
      intl={intl}
      userId={5}
      projectId={1}
      projectKey="demo"
      ticketId="BUG-1"
      btsProject="BUG"
      btsUrl="https://jira"
      pluginName="jira"
      {...props}
    />,
  );

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('IssueInfoTooltip', () => {
  beforeEach(() => {
    localStorage.clear();
    fetch.mockReset();
  });

  test('shows a neutral state to a role that cannot run plugin commands, without a request', () => {
    const wrapper = render({ canLoadDetails: false });

    expect(fetch).not.toHaveBeenCalled();
    expect(wrapper.text()).toContain('Issue details unavailable');
  });

  test('shows a neutral state on 403 and does not repeat the request on the next hover', async () => {
    fetch.mockRejectedValue({ errorCode: 4003, message: 'Forbidden' });
    const wrapper = render();
    await flush();

    expect(wrapper.state()).toMatchObject({ loading: false, unavailable: true, error: false });
    expect(wrapper.text()).toContain('Issue details unavailable');

    const nextHover = render();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(nextHover.text()).toContain('Issue details unavailable');
  });

  test('keeps the error state for other failures', async () => {
    fetch.mockRejectedValue({ errorCode: 5000, message: 'BTS is down' });
    const wrapper = render();
    await flush();

    expect(wrapper.state()).toMatchObject({ loading: false, unavailable: false, error: true });
  });
});
