/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { act, useEffect } from 'react';
import { mount, type ReactWrapper } from 'enzyme';
import { useDispatch, useSelector } from 'react-redux';

import { fetch } from 'common/utils';
import { LifecycleRejectReason } from 'types/aiFactory';

import { useLifecycleActions } from './useLifecycleActions';

jest.mock('react-redux', () => ({ useDispatch: jest.fn(), useSelector: jest.fn() }));
jest.mock('react-intl', () => ({
  defineMessages: (messages: unknown) => messages,
  useIntl: () => ({
    formatMessage: (message: { defaultMessage: string }, values?: Record<string, string | number>) =>
      Object.entries(values ?? {}).reduce(
        (text, [key, value]) => text.replace(`{${key}}`, `${value}`),
        message.defaultMessage,
      ),
  }),
}));
jest.mock('common/utils', () => ({ fetch: jest.fn() }));
jest.mock('controllers/project', () => ({ projectKeySelector: jest.fn() }));
jest.mock('controllers/notification', () => ({
  showErrorNotification: (payload: unknown) => ({ type: 'ERROR', payload }),
  showSuccessNotification: (payload: unknown) => ({ type: 'SUCCESS', payload }),
  showWarningNotification: (payload: unknown) => ({ type: 'WARNING', payload }),
}));

type HookResult = ReturnType<typeof useLifecycleActions>;
const dispatch = jest.fn<void, [{ type: string; payload: { message: string } }]>();
const fetchMock = fetch as jest.MockedFunction<
  (url: string, params?: Record<string, unknown>) => Promise<unknown>
>;
let result: HookResult;

const Harness = () => {
  const lifecycleActions = useLifecycleActions();
  useEffect(() => {
    result = lifecycleActions;
  }, [lifecycleActions]);
  return null;
};

describe('useLifecycleActions', () => {
  let wrapper: ReactWrapper | undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    jest
      .mocked(useDispatch)
      .mockReturnValue(dispatch as unknown as ReturnType<typeof useDispatch>);
    jest.mocked(useSelector).mockReturnValue('demo');
    wrapper = mount(<Harness />);
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
  });

  test('approves an AI case and reports success', async () => {
    fetchMock.mockResolvedValue({ lifecycle: 'READY' });

    await act(async () => {
      await result.updateLifecycle({ id: 42, ai: {} });
    });

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/test-case/42/lifecycle'),
      expect.objectContaining({ method: 'POST', data: { action: 'APPROVE' } }),
    );
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'SUCCESS' }));
  });

  test('returns confirmation-required without showing an error', async () => {
    fetchMock.mockRejectedValue({
      reason: LifecycleRejectReason.EVALUATION_OBSOLETE_CONFIRM_REQUIRED,
    });

    let updateResult;
    await act(async () => {
      updateResult = await result.updateLifecycle({ id: 42, ai: {} });
    });

    expect(updateResult).toBe('CONFIRM_OBSOLETE');
    expect(dispatch).not.toHaveBeenCalled();
  });

  test('names every case skipped by a bulk approval', async () => {
    fetchMock.mockResolvedValue({
      updated: [{ id: 41, reason: 'APPROVED' }],
      skipped: [
        { id: 42, displayId: 'TC42', reason: 'UNSENT_COMMENTS' },
        { id: 43, displayId: 'TC43', reason: 'ALREADY_READY' },
      ],
    });

    await act(async () => {
      await result.updateLifecycleBatch([41, 42, 43]);
    });

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'WARNING',
        payload: {
          message: expect.stringContaining('TC42'),
        },
      }),
    );
    expect(dispatch.mock.calls.at(-1)?.[0].payload.message).toContain('TC43');
  });

  test('rejects a malformed bulk response instead of clearing the selection as success', async () => {
    fetchMock.mockResolvedValue({ updated: [{ id: 41, reason: 'UNKNOWN' }], skipped: [] });

    let updateResult;
    await act(async () => {
      updateResult = await result.updateLifecycleBatch([41]);
    });

    expect(updateResult).toBeNull();
    expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({ type: 'ERROR' }));
  });
});
