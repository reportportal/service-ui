/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { act } from 'react';
import { shallow } from 'enzyme';
import { useDispatch, useSelector } from 'react-redux';

import { useUserPermissions } from 'hooks/useUserPermissions';
import { AutomationStatus, Lifecycle } from 'types/aiFactory';

import { AutomationModalContent, type AutomationModalData } from './automationModal';
import { useAutomationRequest, type AutomationRequestState } from './useAutomationRequest';

jest.mock('@reportportal/ui-kit', () => ({
  Button: 'Button',
  Dropdown: 'Dropdown',
  Modal: 'Modal',
  SystemMessage: 'SystemMessage',
}));
jest.mock('react-redux', () => ({ useDispatch: jest.fn(), useSelector: jest.fn() }));
jest.mock('hooks/useUserPermissions', () => ({ useUserPermissions: jest.fn() }));
jest.mock('react-intl', () => ({
  defineMessages: (messages: unknown) => messages,
  useIntl: () => ({
    formatMessage: (
      message: { defaultMessage?: string; id?: string },
      values?: Record<string, string | number>,
    ) =>
      Object.entries(values ?? {}).reduce(
        (text, [key, value]) => text.replace(`{${key}}`, String(value)),
        message.defaultMessage ?? message.id ?? '',
      ),
  }),
}));
jest.mock('common/utils', () => ({
  createClassnames:
    () =>
    (...classNames: string[]) =>
      classNames.filter(Boolean).join(' '),
}));
jest.mock('controllers/modal', () => ({ hideModalAction: () => ({ type: 'HIDE_MODAL' }) }));
jest.mock('controllers/notification', () => ({
  showSuccessNotification: (payload: unknown) => ({ type: 'SUCCESS', payload }),
  showWarningNotification: (payload: unknown) => ({ type: 'WARNING', payload }),
}));
jest.mock('controllers/project/selectors/typed-selectors', () => ({
  projectKeySelector: jest.fn(),
}));
jest.mock('./useAutomationRequest', () => ({ useAutomationRequest: jest.fn() }));

const dispatch = jest.fn();
const start = jest.fn();
const reloadEnvironments = jest.fn();
jest.mock('pages/inside/aiFactory/pipelineSettings/usePipelineCiConnection', () => ({
  usePipelineCiConnection: () => ({ connection: { state: 'CONNECTED', canStartJobs: true }, refresh: jest.fn() }),
}));

const candidate = {
  id: 42,
  displayId: 'TC42',
  name: 'Checkout',
  lifecycle: Lifecycle.READY,
};
const accepted = {
  iteration: { pipelineId: 2, iterationId: 201, number: 7 },
  accepted: [42],
  skipped: [],
};

const requestState = (overrides: Partial<AutomationRequestState> = {}): AutomationRequestState => ({
  environments: { environments: ['beta5', 'qa'], default: 'beta5' },
  isLoadingEnvironments: false,
  isStarting: false,
  error: null,
  reautomationRequiredIds: [],
  skipped: [],
  start,
  reloadEnvironments,
  ...overrides,
});

const renderModal = (data: AutomationModalData, state = requestState()) => {
  jest.mocked(useAutomationRequest).mockReturnValue(state);

  return shallow(<AutomationModalContent data={{ pipelineId: 2, ...data }} />);
};

describe('AutomationModalContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useUserPermissions).mockReturnValue({
      canAutomateTestCases: true,
    } as ReturnType<typeof useUserPermissions>);
    jest.mocked(useDispatch).mockReturnValue(dispatch);
    jest.mocked(useSelector).mockReturnValue('demo');
  });

  test('loads A1, selects its default and submits the exact A2 payload', async () => {
    start.mockResolvedValue(accepted);
    const onSuccess = jest.fn();
    const wrapper = renderModal({ testCases: [candidate], onSuccess });
    const modal = wrapper.find('Modal');

    expect(useAutomationRequest).toHaveBeenCalledWith('demo', true, 2);
    expect(wrapper.find('Dropdown').props()).toMatchObject({
      value: 'beta5',
      options: [
        { label: 'beta5', value: 'beta5' },
        { label: 'qa', value: 'qa' },
      ],
    });
    expect(modal.prop('okButton')).toMatchObject({ disabled: false });

    await act(async () => {
      (modal.prop('okButton') as { onClick: () => void }).onClick();
      await Promise.resolve();
    });

    expect(start).toHaveBeenCalledWith({
      testCaseIds: [42],
      environment: 'beta5',
    });
    expect(onSuccess).toHaveBeenCalledWith(accepted);
    expect(dispatch).toHaveBeenCalledWith({
      type: 'SUCCESS',
      payload: { message: 'Automation iteration #7 started for 1 Test Cases' },
    });
    expect(dispatch).toHaveBeenLastCalledWith({ type: 'HIDE_MODAL' });
  });

  test('keeps a directly mounted modal read-only for a viewer', async () => {
    jest.mocked(useUserPermissions).mockReturnValue({
      canAutomateTestCases: false,
    } as ReturnType<typeof useUserPermissions>);
    const wrapper = renderModal({ testCases: [candidate] });
    const modal = wrapper.find('Modal');

    expect(useAutomationRequest).toHaveBeenCalledWith('demo', true, 2);
    expect(modal.prop('okButton')).toMatchObject({ disabled: true });

    await act(async () => {
      (modal.prop('okButton') as { onClick: () => void }).onClick();
      await Promise.resolve();
    });
    expect(start).not.toHaveBeenCalled();
  });

  test('shows the selected case without enabling requests or offering submission in preview', () => {
    const wrapper = renderModal(
      { testCases: [candidate], isPreview: true },
      requestState({ environments: null }),
    );

    expect(useAutomationRequest).toHaveBeenCalledWith('demo', false, 2);
    expect(wrapper.find('.automation-modal__case-list').text()).toContain('TC42 · Checkout');
    expect(wrapper.find('SystemMessage').text()).toContain('once the automation integration is available');
    expect(wrapper.find('Modal').prop('okButton')).toBeUndefined();
    expect(wrapper.find('Dropdown')).toHaveLength(0);
    expect(start).not.toHaveBeenCalled();
  });

  test('uses responsive modal and case-list classes', () => {
    const wrapper = renderModal({ testCases: [candidate] });

    expect(wrapper.find('.automation-modal')).toHaveLength(1);
    expect(wrapper.find('.automation-modal__case-list')).toHaveLength(1);
    expect(wrapper.find('Dropdown').prop('className')).toBe('automation-modal__environment');
  });

  test('uses the explicitly selected environment', async () => {
    start.mockResolvedValue(accepted);
    const wrapper = renderModal({ testCases: [candidate] });

    act(() => {
      (wrapper.find('Dropdown').prop('onChange') as (value: string) => void)('qa');
    });
    await act(async () => {
      (wrapper.find('Modal').prop('okButton') as { onClick: () => void }).onClick();
      await Promise.resolve();
    });

    expect(start).toHaveBeenCalledWith(expect.objectContaining({ environment: 'qa' }));
  });

  test('renders skipped cases and keeps submission disabled when none are eligible', () => {
    const wrapper = renderModal({
      testCases: [{ ...candidate, lifecycle: Lifecycle.DRAFT }],
    });

    expect(wrapper.text()).toContain('TC42 · Checkout');
    expect(wrapper.text()).toContain('Not Ready');
    expect(wrapper.find('Modal').prop('okButton')).toMatchObject({ disabled: true });
  });

  test('lets the backend determine which already automated candidates require confirmation', async () => {
    start.mockResolvedValue(null);
    const wrapper = renderModal({
      testCases: [{ ...candidate, automation: { status: AutomationStatus.AUTOMATED } }],
    });

    const action = wrapper.find('Modal').prop('okButton') as { disabled: boolean; onClick: () => void };
    expect(action.disabled).toBe(false);
    await act(async () => {
      action.onClick();
      await Promise.resolve();
    });

    expect(start).toHaveBeenCalledWith({ testCaseIds: [42], environment: 'beta5' });
  });

  test('confirms exactly the cases identified by the backend conflict', async () => {
    start.mockResolvedValue(null);
    const second = { ...candidate, id: 43, displayId: 'TC43', name: 'Other checkout' };
    const wrapper = renderModal(
      { testCases: [candidate, second] },
      requestState({
        error: 'REAUTOMATE_CONFIRMATION_REQUIRED',
        reautomationRequiredIds: [42],
      }),
    );

    const modal = wrapper.find('Modal');
    expect(modal.prop('title')).toBe('Automate again?');
    expect(wrapper.find('.automation-modal__case-list').text()).toContain('TC42 · Checkout');
    expect(wrapper.find('.automation-modal__case-list').text()).not.toContain('TC43');
    expect(modal.prop('okButton')).toMatchObject({ children: 'Automate again', disabled: false });

    await act(async () => {
      (modal.prop('okButton') as { onClick: () => void }).onClick();
      await Promise.resolve();
    });

    expect(start).toHaveBeenCalledWith({
      testCaseIds: [42, 43],
      environment: 'beta5',
      confirmReautomate: true,
      confirmedTestCaseIds: [42],
    });
  });

  test('does not show an environment picker before CI environments are configured', () => {
    const wrapper = renderModal(
      { testCases: [candidate] },
      requestState({ environments: null, error: 'ENVIRONMENTS_NOT_CONFIGURED' }),
    );

    expect(wrapper.find('SystemMessage').text()).toContain('Set up environments');
    expect(wrapper.find('Dropdown')).toHaveLength(0);
    expect(wrapper.find('Modal').prop('okButton')).toMatchObject({ disabled: true });
  });

  test('shows the server skip reason and zero eligible cases after a stale selection', () => {
    const wrapper = renderModal(
      { testCases: [candidate] },
      requestState({
        error: 'NO_ELIGIBLE_TEST_CASES',
        skipped: [{ id: 42, displayId: 'TC42', reason: 'FIX_RUNNING' }],
      }),
    );

    expect(wrapper.text()).toContain('1 selected · 0 eligible');
    expect(wrapper.find('.automation-modal__case-list')).toHaveLength(0);
    expect(wrapper.find('.automation-modal__skipped-list').text()).toContain('Fix is running');
    expect(wrapper.find('Modal').prop('okButton')).toMatchObject({ disabled: true });
  });

  test('lists requested cases and reports authoritative backend skips with truthful count', async () => {
    const secondCandidate = {
      ...candidate,
      id: 43,
      displayId: 'TC43',
      name: 'Refund',
    };
    const acceptedWithSkipped = {
      ...accepted,
      skipped: [{ id: 43, displayId: 'TC43', reason: 'FIX_RUNNING' as const }],
    };
    start.mockResolvedValue(acceptedWithSkipped);
    const onSuccess = jest.fn();
    const wrapper = renderModal({ testCases: [candidate, secondCandidate], onSuccess });

    expect(wrapper.text()).toContain('Test Cases');
    expect(wrapper.text()).toContain('TC42 · Checkout');
    expect(wrapper.text()).toContain('TC43 · Refund');

    await act(async () => {
      (wrapper.find('Modal').prop('okButton') as { onClick: () => void }).onClick();
      await Promise.resolve();
    });

    expect(start).toHaveBeenCalledWith({
      testCaseIds: [42, 43],
      environment: 'beta5',
    });
    expect(onSuccess).toHaveBeenCalledWith(acceptedWithSkipped);
    expect(dispatch).toHaveBeenCalledWith({
      type: 'WARNING',
      payload: {
        message:
          'Automation iteration #7 started for 1 Test Cases. Skipped: TC43 · Refund — Fix is running',
      },
    });
  });

  test.each([
    ['JOB_START_FAILED', 'Automation could not be started'],
    ['INVALID_AUTOMATION_RESPONSE', 'Automation returned an invalid response'],
    ['INVALID_ENVIRONMENTS_RESPONSE', 'The environments response is invalid'],
  ] as const)('keeps %s inline without closing', (error, message) => {
    const wrapper = renderModal({ testCases: [candidate] }, requestState({ error }));

    expect(wrapper.find('SystemMessage').text().toLowerCase()).toContain(message.toLowerCase());
    expect(dispatch).not.toHaveBeenCalled();
  });

  test('retries A1 errors inline', () => {
    const wrapper = renderModal(
      { testCases: [candidate] },
      requestState({ environments: null, error: 'ENVIRONMENTS_LOAD_FAILED' }),
    );

    (
      wrapper
        .find('[data-automation-id="retryAutomationEnvironments"]')
        .prop('onClick') as () => void
    )();

    expect(reloadEnvironments).toHaveBeenCalled();
    expect(wrapper.find('Modal').prop('okButton')).toMatchObject({ disabled: true });
  });

  test.each([
    ['loading environments', { isLoadingEnvironments: true }],
    ['starting A2', { isStarting: true }],
    ['missing environments', { environments: null }],
  ])('disables Send while %s', (_label, state) => {
    const wrapper = renderModal({ testCases: [candidate] }, requestState(state));

    expect(wrapper.find('Modal').prop('okButton')).toMatchObject({ disabled: true });
  });

  test('prevents closing while A2 is in flight and closes otherwise', () => {
    const starting = renderModal({ testCases: [candidate] }, requestState({ isStarting: true }));
    (starting.find('Modal').prop('onClose') as () => void)();
    expect(dispatch).not.toHaveBeenCalled();
    expect(starting.find('Modal').props()).toMatchObject({
      allowCloseOutside: false,
      cancelButton: expect.objectContaining({ disabled: true }),
    });

    const idle = renderModal({ testCases: [candidate] });
    (idle.find('Modal').prop('onClose') as () => void)();
    expect(dispatch).toHaveBeenCalledWith({ type: 'HIDE_MODAL' });
  });
});
