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

import { AiDetailsSectionState, type AiDetailsSectionStateProps } from './aiDetailsSectionState';

jest.mock('@reportportal/ui-kit', () => ({ BubblesLoader: 'BubblesLoader', Button: 'Button' }));

const onRetry = jest.fn();
const props: AiDetailsSectionStateProps = {
  children: <span>Loaded</span>,
  className: 'state',
  isLoading: false,
  isError: false,
  loadingLabel: 'Loading section',
  errorMessage: 'Section failed',
  retryLabel: 'Retry',
  retryAutomationId: 'retry-section',
  onRetry,
};

describe('AiDetailsSectionState', () => {
  test('renders accessible loading output before an error', () => {
    const wrapper = shallow(<AiDetailsSectionState {...props} isLoading isError />);

    expect(wrapper.find('output').prop('aria-label')).toBe('Loading section');
    expect(wrapper.find('[role="alert"]')).toHaveLength(0);
  });

  test('renders an error and retries the shared request', () => {
    const wrapper = shallow(<AiDetailsSectionState {...props} isError />);

    expect(wrapper.find('[role="alert"]').text()).toContain('Section failed');
    const retryButton = wrapper.find('[data-automation-id="retry-section"]').props();
    (retryButton.onClick as () => void)();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('renders loaded content', () => {
    const wrapper = shallow(<AiDetailsSectionState {...props} />);

    expect(wrapper.text()).toBe('Loaded');
  });
});
