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
import { Checkbox } from '@reportportal/ui-kit';

import { EditScenarioModalContentInner } from './editScenarioModalContent';
import type { EditScenarioModalContentProps } from './types';
import { useModalActions } from '../hooks/useModalActions';
import { useAttachmentValidation } from '../createTestCaseModal/attachmentValidationContext';

jest.mock('@reportportal/ui-kit', () => ({ Checkbox: 'Checkbox', Modal: 'Modal' }));
jest.mock('components/modalLoadingOverlay', () => ({
  ModalLoadingOverlay: 'ModalLoadingOverlay',
}));
jest.mock('./scenarioFields', () => ({ ScenarioFields: 'ScenarioFields' }));
jest.mock('../hooks/useModalActions', () => ({ useModalActions: jest.fn() }));
jest.mock('../createTestCaseModal/attachmentValidationContext', () => ({
  AttachmentValidationProvider: ({ children }: { children: React.ReactNode }) => children,
  useAttachmentValidation: jest.fn(),
}));

const props: EditScenarioModalContentProps = {
  title: 'Edit Scenario',
  submitButtonText: 'Save',
  isLoading: false,
  onSubmitHandler: jest.fn(),
  formName: 'editScenario',
  handleSubmit: () => () => undefined,
};

describe('EditScenarioModal lifecycle controls', () => {
  beforeEach(() => {
    jest.mocked(useAttachmentValidation).mockReturnValue({
      hasBlockingAttachments: false,
    } as ReturnType<typeof useAttachmentValidation>);
    jest.mocked(useModalActions).mockReturnValue({
      okButton: {},
      cancelButton: {},
      handleClose: jest.fn(),
      handleFormSubmit: jest.fn(),
    } as unknown as ReturnType<typeof useModalActions>);
  });

  test('shows the Ready-case demotion hint', () => {
    const wrapper = shallow(
      <EditScenarioModalContentInner {...props} lifecycleHint="Status will be set to Draft" />,
    );

    expect(wrapper.text()).toContain('Status will be set to Draft');
    expect(wrapper.find(Checkbox)).toHaveLength(0);
  });

  test('shows a disabled promote checkbox with its blocker for a Draft case', () => {
    const wrapper = shallow(
      <EditScenarioModalContentInner
        {...props}
        promoteToReadyLabel="Approve along with these changes"
        promoteToReadyDisabledHint="Push comments first"
      />,
    );

    expect(wrapper.find(Checkbox).prop('disabled')).toBe(true);
    expect(wrapper.text()).toContain('Push comments first');
  });
});
