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

import { act, ComponentProps, createElement } from 'react';
import { mount } from 'enzyme';
import { IntlProvider } from 'react-intl';
import { Provider } from 'react-redux';
import { combineReducers, createStore } from 'redux';
import { change, reducer as formReducer } from 'redux-form';
import { fetch } from 'common/utils';
import { activeManualLaunchExecutionSelector } from 'controllers/manualLaunch';
import { namedAvailableBtsIntegrationsSelector } from 'controllers/plugins';
import { projectInfoSelector, projectKeySelector } from 'controllers/project';
import { useModalButtons } from 'hooks/useModalButtons';
import { BTSIssuesModal } from './BTSIssuesModal';

const mockDispatch = jest.fn();
let mockExecution = { id: 5, testItemId: 50 };
let mockFormErrors: Record<string, string> = {};
let segmentedControlOnChange: (value: string) => void = () => {};

const integration = {
  id: 1,
  integrationParameters: {
    project: 'EPM',
    url: 'https://jira',
    defectFormFields: [{ id: 'summary', fieldName: 'Summary', fieldType: 'string', value: [] }],
  },
  integrationType: { details: { allowedCommands: [] } },
};

const mockUseSelector = jest.fn();

jest.mock('react-redux', () => ({
  ...jest.requireActual<Record<string, unknown>>('react-redux'),
  useDispatch: () => mockDispatch,
  useSelector: (selector: unknown) => mockUseSelector(selector) as unknown,
}));

jest.mock('@reportportal/ui-kit', () => ({
  ...jest.requireActual<Record<string, unknown>>('@reportportal/ui-kit'),
  Modal: ({ children }: { children: unknown }) => children,
  SegmentedControl: ({ onChange }: { onChange: (value: string) => void }) => {
    segmentedControlOnChange = onChange;
    return null;
  },
}));

jest.mock('./PostBTSIssueForm/PostBTSIssueForm', () => ({ PostBTSIssueForm: () => null }));
jest.mock('./LinkBTSIssueForm', () => ({ LinkBTSIssueForm: () => null }));

jest.mock('pages/inside/stepPage/modals/postIssueModal/utils', () => ({
  ...jest.requireActual<Record<string, unknown>>(
    'pages/inside/stepPage/modals/postIssueModal/utils',
  ),
  validate: () => mockFormErrors,
}));

jest.mock('react-tracking', () => ({
  useTracking: () => ({ trackEvent: jest.fn() }),
}));

jest.mock('common/utils', () => ({
  ...jest.requireActual<Record<string, unknown>>('common/utils'),
  fetch: jest.fn(),
}));

jest.mock('hooks/useTypedSelector', () => ({
  useManualLaunchId: () => '10',
}));

jest.mock('hooks/useModalButtons', () => ({
  useModalButtons: jest.fn(() => ({ okButton: {}, cancelButton: {}, hideModal: jest.fn() })),
}));

const mockedFetch = fetch as unknown as jest.Mock;
const mockedUseModalButtons = useModalButtons as unknown as jest.Mock;

type ModalButtonsParams = { onSubmit: () => void; isSubmitButtonDisabled: boolean };
const lastModalButtons = () => {
  const calls = mockedUseModalButtons.mock.calls as Array<[ModalButtonsParams]>;

  return calls[calls.length - 1][0];
};

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

const linkCalls = () =>
  (mockedFetch.mock.calls as Array<[string, { method?: string; data?: unknown }?]>).filter(
    ([url]) => url.includes('issue/link'),
  );

// Posts an issue to BTS whose link to the execution fails, leaving the modal in the retry state.
const renderWithFailedLink = async () => {
  const store = createStore(combineReducers({ form: formReducer }));
  mockedFetch.mockImplementation((url: string) =>
    url.includes('issue/link')
      ? Promise.reject(new Error('link failed'))
      : Promise.resolve({ id: 'EPM-1', url: 'https://jira/EPM-1' }),
  );

  const modal = createElement(
    IntlProvider,
    { locale: 'en' },
    createElement(BTSIssuesModal, { data: { executionId: 5, entryPlace: 'test' } }),
  );

  mount(createElement(Provider, { store } as ComponentProps<typeof Provider>, modal));

  await act(async () => {
    segmentedControlOnChange('post');
    await flush();
  });
  await act(async () => {
    lastModalButtons().onSubmit();
    await flush();
  });

  return store;
};

describe('BTSIssuesModal', () => {
  beforeEach(() => {
    mockedFetch.mockReset();
    mockedUseModalButtons.mockClear();
    mockExecution = { id: 5, testItemId: 50 };
    mockFormErrors = {};
    mockUseSelector.mockImplementation((selector: unknown) => {
      switch (selector) {
        case namedAvailableBtsIntegrationsSelector:
          return { jira: [integration] };
        case activeManualLaunchExecutionSelector:
          return mockExecution;
        case projectKeySelector:
          return 'demo';
        case projectInfoSelector:
          return { projectId: 1 };
        default:
          return undefined;
      }
    });
  });

  test('a link retry targets the execution the issue was created for', async () => {
    const store = await renderWithFailedLink();

    expect(linkCalls()).toHaveLength(1);

    mockExecution = { id: 7, testItemId: 70 };
    await act(async () => {
      store.dispatch(change('btsIssuesModalForm', 'summary', 'changed'));
      await flush();
    });
    await act(async () => {
      lastModalButtons().onSubmit();
      await flush();
    });

    const retries = linkCalls();
    expect(retries).toHaveLength(2);
    expect(retries[1][1]?.data).toMatchObject({
      issues: [{ ticketId: 'EPM-1' }],
      testItemIds: [50],
    });
  });
});
