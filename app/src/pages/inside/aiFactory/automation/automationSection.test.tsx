/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { shallow } from 'enzyme';

import { Lifecycle } from 'types/aiFactory';

import { AutomationSection } from './automationSection';
import { useAutomationModal } from './useAutomationModal';

jest.mock('@reportportal/ui-kit', () => ({ Button: 'Button' }));
jest.mock('react-intl', () => ({
  defineMessages: (messages: unknown) => messages,
  useIntl: () => ({
    formatMessage: (message: { defaultMessage?: string; id?: string }) =>
      message.defaultMessage ?? message.id ?? '',
  }),
}));
jest.mock('common/utils', () => ({
  createClassnames:
    () =>
    (...classNames: string[]) =>
      classNames.filter(Boolean).join(' '),
}));
jest.mock('components/collapsibleSection', () => ({
  CollapsibleSection: 'CollapsibleSection',
}));
jest.mock('./useAutomationModal', () => ({ useAutomationModal: jest.fn() }));

const openModal = jest.fn();
const testCase = {
  id: 42,
  displayId: 'TC42',
  name: 'Checkout',
  lifecycle: Lifecycle.READY,
};

describe('AutomationSection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useAutomationModal).mockReturnValue({ openModal });
  });

  test('opens the modal for an eligible case and forwards the success callback', () => {
    const onSuccess = jest.fn();
    const wrapper = shallow(<AutomationSection testCase={testCase} onSuccess={onSuccess} />);

    (wrapper.find('[data-automation-id="automateTestCase"]').prop('onClick') as () => void)();

    expect(openModal).toHaveBeenCalledWith({ testCases: [testCase], onSuccess });
    expect(wrapper.find('[data-automation-id="automateTestCase"]').prop('disabled')).toBe(false);
  });

  test('disables automation and explains a missing lifecycle fail-safe', () => {
    const wrapper = shallow(
      <AutomationSection testCase={{ ...testCase, lifecycle: undefined }} />,
    );

    expect(wrapper.find('[data-automation-id="automateTestCase"]').prop('disabled')).toBe(true);
    expect(wrapper.text()).toContain('Only Ready Test Cases can be automated');
  });
});
