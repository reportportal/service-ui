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
import { Button, Tooltip } from '@reportportal/ui-kit';

import { useAiFactoryEnabled } from 'controllers/aiFactory';
import { Lifecycle } from 'types/aiFactory';
import { TestCaseManualScenario, type ManualScenario } from 'types/testCase';

import { useAddToLaunchModal } from '../addToLaunchModal';
import { AddToLaunchButton } from './addToLaunchButton';

jest.mock('@reportportal/ui-kit', () => ({ Button: 'Button', Tooltip: 'Tooltip' }));
jest.mock(
  'analyticsEvents/testCaseLibraryPageEvents',
  () => ({
    SIDE_PANEL_QUICK_ACTION_ELEMENT_NAME: { ADD_TO_LAUNCH: 'ADD_TO_LAUNCH' },
    TEST_CASE_LIBRARY_EVENTS: { clickSidePanelQuickAction: jest.fn() },
    TEST_CASE_PLACE: { SIDE_PANEL: 'SIDE_PANEL', DETAILS_PAGE: 'DETAILS_PAGE' },
  }),
  { virtual: true },
);
jest.mock('react-intl', () => ({
  defineMessages: (messages: unknown) => messages,
  useIntl: () => ({
    formatMessage: (message: { defaultMessage?: string; id?: string }) =>
      message.defaultMessage ?? message.id ?? '',
  }),
}));
jest.mock('react-tracking', () => ({ useTracking: () => ({ trackEvent: jest.fn() }) }));
jest.mock('common/utils', () => ({ createClassnames: () => () => '' }));
jest.mock('controllers/aiFactory', () => ({ useAiFactoryEnabled: jest.fn() }));
jest.mock('../addToLaunchModal', () => ({ useAddToLaunchModal: jest.fn() }));

const scenario = {
  manualScenarioType: TestCaseManualScenario.TEXT,
  instructions: 'Open the page',
  steps: [],
} as unknown as ManualScenario;

const renderButton = (
  isEnabled: boolean,
  lifecycle = Lifecycle.DRAFT,
  manualScenario: ManualScenario | undefined = scenario,
) => {
  jest.mocked(useAiFactoryEnabled).mockReturnValue(isEnabled);
  jest.mocked(useAddToLaunchModal).mockReturnValue({ openModal: jest.fn() });

  return shallow(
    <AddToLaunchButton
      testCaseId={1}
      manualScenario={manualScenario}
      lifecycle={lifecycle}
      place="details_page"
    />,
  );
};

describe('AddToLaunchButton ready-only gate', () => {
  test('disables a Draft case with the exact hint while the feature is enabled', () => {
    const wrapper = renderButton(true);

    expect(wrapper.find(Button).prop('disabled')).toBe(true);
    expect(wrapper.find(Tooltip).prop('content')).toBe(
      'Only Ready Test Cases can be added to a Launch',
    );
  });

  test('preserves the existing enabled action while the feature is disabled', () => {
    const wrapper = renderButton(false);

    expect(wrapper.find(Button).prop('disabled')).toBe(false);
    expect(wrapper.find(Tooltip)).toHaveLength(0);
  });

  test('allows a Ready case while the feature is enabled', () => {
    expect(renderButton(true, Lifecycle.READY).find(Button).prop('disabled')).toBe(false);
  });

  test('keeps a Ready case without scenario details disabled with the scenario hint', () => {
    const wrapper = renderButton(true, Lifecycle.READY, {} as ManualScenario);

    expect(wrapper.find(Button).prop('disabled')).toBe(true);
    expect(wrapper.find(Tooltip).prop('content')).toBe(
      'Add scenario details to be able to add this test case to launch',
    );
  });
});
