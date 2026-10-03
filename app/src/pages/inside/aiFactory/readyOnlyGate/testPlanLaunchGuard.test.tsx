/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { shallow } from 'enzyme';
import Link from 'redux-first-router-link';
import { Button, SystemMessage, Tooltip } from '@reportportal/ui-kit';

import { TEST_CASE_LIBRARY_PAGE } from 'controllers/pages';

import { TestPlanLaunchBlockedBanner, TestPlanLaunchButton } from './testPlanLaunchGuard';

jest.mock('@reportportal/ui-kit', () => ({
  Button: 'Button',
  SystemMessage: 'SystemMessage',
  Tooltip: 'Tooltip',
}));
jest.mock('redux-first-router-link', () => 'Link');
jest.mock('react-intl', () => ({
  defineMessages: (messages: unknown) => messages,
  useIntl: () => ({
    formatMessage: (_message: unknown, values: { count: number }) =>
      `Launch blocked: ${values.count} Draft Test ${values.count === 1 ? 'Case' : 'Cases'}`,
  }),
}));
jest.mock('common/utils', () => ({
  createClassnames:
    () =>
    (...classNames: string[]) =>
      classNames.join(' '),
}));
jest.mock('controllers/pages', () => ({ TEST_CASE_LIBRARY_PAGE: 'TEST_CASE_LIBRARY_PAGE' }));
jest.mock('hooks/useTypedSelector', () => ({
  useProjectDetails: () => ({ organizationSlug: 'org', projectSlug: 'project' }),
}));

const draftCases = [
  { id: 108, displayId: 'TC108' },
  { id: 109, displayId: 'TC109' },
];

describe('Test Plan launch guard', () => {
  test('shows the blocked count and links every loaded Draft case to Library details', () => {
    const wrapper = shallow(
      <TestPlanLaunchBlockedBanner draftCount={2} draftTestCases={draftCases} isBlocked />,
    );
    const links = wrapper.find(Link);

    expect(wrapper.find(SystemMessage).text()).toContain('Launch blocked: 2 Draft Test Cases');
    expect(links.length).toBe(2);
    expect(wrapper.text()).toContain('TC108');
    expect(wrapper.text()).toContain('TC109');

    const singleLinkWrapper = shallow(
      <TestPlanLaunchBlockedBanner
        draftCount={1}
        draftTestCases={[draftCases[0]]}
        isBlocked
      />,
    );
    expect(singleLinkWrapper.find(Link).prop('to')).toEqual({
      type: TEST_CASE_LIBRARY_PAGE,
      payload: {
        organizationSlug: 'org',
        projectSlug: 'project',
        testCasePageRoute: 'test-cases/108',
      },
    });
  });

  test('renders no banner when launching is allowed', () => {
    const wrapper = shallow(
      <TestPlanLaunchBlockedBanner draftCount={0} draftTestCases={[]} isBlocked={false} />,
    );

    expect(wrapper.html()).toBeNull();
  });

  test('disables the plan launch button and explains the blocker', () => {
    const wrapper = shallow(
      <TestPlanLaunchButton draftCount={1} isBlocked label="Add to Launch" onClick={jest.fn()} />,
    );

    expect(wrapper.find(Tooltip).prop('content')).toBe('Launch blocked: 1 Draft Test Case');
    expect(wrapper.find(Button).prop('disabled')).toBe(true);
  });

  test('keeps the plan launch button enabled without Draft cases', () => {
    const onClick = jest.fn();
    const wrapper = shallow(
      <TestPlanLaunchButton
        draftCount={0}
        isBlocked={false}
        label="Add to Launch"
        onClick={onClick}
      />,
    );

    expect(wrapper.find(Tooltip)).toHaveLength(0);
    expect(wrapper.find(Button).prop('disabled')).toBe(false);
    const handleClick = wrapper.find(Button).prop('onClick') as () => void;
    handleClick();
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
