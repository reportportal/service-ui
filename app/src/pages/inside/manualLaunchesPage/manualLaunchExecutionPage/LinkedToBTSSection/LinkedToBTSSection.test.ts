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

import { act, createElement } from 'react';
import { mount } from 'enzyme';
import { IntlProvider } from 'react-intl';
import { IssueList } from '@reportportal/ui-kit';
import { fetch } from 'common/utils';
import { getManualLaunchExecutionAction, TestCaseExecution } from 'controllers/manualLaunch';
import { ExecutionStatus } from 'types/testCase';
import { LinkedToBTSSection } from './LinkedToBTSSection';

const mockDispatch = jest.fn();

jest.mock('react-redux', () => ({
  ...jest.requireActual<Record<string, unknown>>('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: () => 'demo',
}));

jest.mock('@reportportal/ui-kit', () => ({
  ...jest.requireActual<Record<string, unknown>>('@reportportal/ui-kit'),
  IssueList: () => null,
}));

jest.mock('react-tracking', () => ({
  useTracking: () => ({ trackEvent: jest.fn() }),
}));

jest.mock('common/utils', () => ({
  ...jest.requireActual<Record<string, unknown>>('common/utils'),
  fetch: jest.fn(),
}));

jest.mock('hooks/useUserPermissions', () => ({
  useUserPermissions: () => ({ canManageExecutions: true }),
}));

jest.mock('hooks/useTypedSelector', () => ({
  useManualLaunchId: () => '10',
}));

jest.mock('../BTSIssuesModal/useBTSIssuesModal', () => ({
  useBTSIssuesModal: () => ({ openModal: jest.fn() }),
}));

const mockedFetch = fetch as unknown as jest.Mock;

const ticket = {
  ticketId: 'EPM-1',
  url: 'https://jira/EPM-1',
  btsProject: 'EPM',
  btsUrl: 'https://jira',
  pluginName: 'jira',
};
const execution = {
  id: 5,
  testItemId: 50,
  executionStatus: ExecutionStatus.FAILED,
  btsTickets: [ticket],
} as unknown as TestCaseExecution;

describe('LinkedToBTSSection', () => {
  test('unlinking a ticket reloads the execution from the server', async () => {
    mockedFetch.mockResolvedValue({});
    type Wrapper = { find: (component: unknown) => { prop: (name: string) => unknown } };
    const wrapper = mount(
      createElement(
        IntlProvider,
        { locale: 'en' },
        createElement(LinkedToBTSSection, { execution }),
      ),
    ) as unknown as Wrapper;
    const onIssueRemove = wrapper.find(IssueList).prop('onIssueRemove') as (issue: unknown) => void;

    await act(async () => {
      onIssueRemove({ ticketId: 'EPM-1' });
      await Promise.resolve();
    });

    expect(mockedFetch).toHaveBeenCalledWith(expect.stringContaining('unlink'), {
      method: 'PUT',
      data: { ticketIds: ['EPM-1'], testItemIds: [50] },
    });
    expect(mockDispatch).toHaveBeenCalledWith(
      getManualLaunchExecutionAction({ launchId: '10', executionId: 5 }),
    );
  });
});
