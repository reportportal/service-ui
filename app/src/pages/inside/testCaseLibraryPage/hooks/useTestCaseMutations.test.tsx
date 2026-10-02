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

import { act, useEffect } from 'react';
import { mount, type ReactWrapper } from 'enzyme';
import { useDispatch, useSelector } from 'react-redux';

import { useAiFactoryEnabled } from 'controllers/aiFactory';
import { fetch } from 'common/utils';
import { useDebouncedSpinner, useNotification } from 'common/hooks';

import { buildManualScenario, buildTestCaseData } from '../createTestCaseModal/testCaseUtils';
import { useFolderActions } from './useFolderActions';
import { useRefetchCurrentTestCases } from './useRefetchCurrentTestCases';
import { useTestCaseMutations } from './useTestCaseMutations';

jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
}));
jest.mock('controllers/project', () => ({ projectKeySelector: jest.fn() }));
jest.mock('controllers/testCase', () => ({ GET_TEST_CASE_DETAILS: 'GET_TEST_CASE_DETAILS' }));
jest.mock('controllers/modal', () => ({ hideModalAction: jest.fn(() => ({ type: 'HIDE_MODAL' })) }));
jest.mock('controllers/aiFactory', () => ({ useAiFactoryEnabled: jest.fn() }));
jest.mock('common/utils', () => ({ fetch: jest.fn() }));
jest.mock('common/hooks', () => ({
  useDebouncedSpinner: jest.fn(),
  useNotification: jest.fn(),
}));
jest.mock('../createTestCaseModal/testCaseUtils', () => ({
  buildManualScenario: jest.fn(),
  buildTestCaseData: jest.fn(),
  processFolder: jest.fn(() => ({})),
}));
jest.mock('./useFolderActions', () => ({ useFolderActions: jest.fn() }));
jest.mock('./useRefetchCurrentTestCases', () => ({ useRefetchCurrentTestCases: jest.fn() }));

type HookResult = ReturnType<typeof useTestCaseMutations>;
type EditTestCasePayload = Parameters<HookResult['editTestCase']>[0];

const dispatch = jest.fn();
const showSpinner = jest.fn();
const hideSpinner = jest.fn();
const showSuccessNotification = jest.fn();
const showErrorNotification = jest.fn();
const processFolderDestinationAndComplete = jest.fn();
const createNewStoreFolder = jest.fn();
const refetchCurrentTestCases = jest.fn();
const fetchMock = fetch as unknown as jest.MockedFunction<
  (url: string, params?: unknown) => Promise<unknown>
>;

let hookResult: HookResult;

interface HarnessProps {
  onResult: (result: HookResult) => void;
}

const Harness = ({ onResult }: HarnessProps) => {
  const result = useTestCaseMutations(42);

  useEffect(() => onResult(result), [onResult, result]);

  return null;
};

const captureHookResult = (result: HookResult) => {
  hookResult = result;
};

const payload = { attributes: [] } as EditTestCasePayload;

describe('useTestCaseMutations lifecycle notifications', () => {
  let wrapper: ReactWrapper | undefined;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useDispatch).mockReturnValue(dispatch);
    jest.mocked(useSelector).mockReturnValue('demo');
    jest.mocked(useDebouncedSpinner).mockReturnValue({
      isLoading: false,
      showSpinner,
      hideSpinner,
    });
    jest.mocked(useNotification).mockReturnValue({
      showSuccessNotification,
      showErrorNotification,
    });
    jest.mocked(useFolderActions).mockReturnValue({
      createNewStoreFolder,
      processFolderDestinationAndComplete,
    });
    jest.mocked(useRefetchCurrentTestCases).mockReturnValue(refetchCurrentTestCases);
    jest.mocked(buildManualScenario).mockReturnValue({} as ReturnType<typeof buildManualScenario>);
    jest.mocked(buildTestCaseData).mockReturnValue({} as ReturnType<typeof buildTestCaseData>);
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
  });

  test.each([
    {
      description: 'uses the scenario-demotion message for TO_DRAFT while AI Factory is enabled',
      isEnabled: true,
      lifecycleChanged: 'TO_DRAFT' as const,
      expectedMessageId: 'testCaseScenarioChangedToDraft',
    },
    {
      description: 'keeps the generic message for another lifecycle result',
      isEnabled: true,
      lifecycleChanged: 'TO_READY' as const,
      expectedMessageId: 'testCaseUpdatedSuccess',
    },
    {
      description: 'keeps the generic message for TO_DRAFT while AI Factory is disabled',
      isEnabled: false,
      lifecycleChanged: 'TO_DRAFT' as const,
      expectedMessageId: 'testCaseUpdatedSuccess',
    },
  ])('$description', async ({ isEnabled, lifecycleChanged, expectedMessageId }) => {
    jest.mocked(useAiFactoryEnabled).mockReturnValue(isEnabled);
    fetchMock.mockResolvedValue({ lifecycleChanged });
    wrapper = mount(<Harness onResult={captureHookResult} />);

    await act(async () => {
      await hookResult.editTestCase(payload);
    });

    expect(showSuccessNotification).toHaveBeenCalledTimes(1);
    expect(showSuccessNotification).toHaveBeenCalledWith({ messageId: expectedMessageId });
    expect(showErrorNotification).not.toHaveBeenCalled();
    expect(refetchCurrentTestCases).toHaveBeenCalledTimes(isEnabled ? 1 : 0);
  });

  test('does not refetch the list for a details-page scenario update', async () => {
    jest.mocked(useAiFactoryEnabled).mockReturnValue(true);
    fetchMock.mockResolvedValue({ lifecycleChanged: 'TO_DRAFT' });
    wrapper = mount(<Harness onResult={captureHookResult} />);

    await act(async () => {
      await hookResult.editTestCase(payload, undefined, true);
    });

    expect(refetchCurrentTestCases).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({
      type: 'GET_TEST_CASE_DETAILS',
      payload: { testCaseId: 42 },
    });
  });
});
