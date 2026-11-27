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
import { createRoot, Root } from 'react-dom/client';

import { CreateManualLaunchDto, LaunchFormData } from 'pages/inside/common/launchFormFields/types';

import { useCreateManualLaunchFromList } from './useCreateManualLaunchFromList';

const mockDispatch = jest.fn();
const mockCreateNewManualLaunch = jest.fn<Promise<void>, [string, CreateManualLaunchDto]>();

jest.mock('react-redux', () => ({
  useDispatch: () => mockDispatch,
  useSelector: () => 'my-organization.it2',
}));
jest.mock('react-intl', () => ({
  defineMessages: <T,>(messages: T) => messages,
  useIntl: () => ({
    formatMessage: ({ defaultMessage }: { defaultMessage: string }) => defaultMessage,
  }),
}));
jest.mock('controllers/project', () => ({ projectKeySelector: jest.fn() }));
jest.mock('controllers/modal', () => ({ hideModalAction: () => ({ type: 'hideModal' }) }));
jest.mock('controllers/notification', () => ({
  showSuccessNotification: (payload: unknown) => ({ type: 'success', payload }),
  showErrorNotification: (payload: unknown) => ({ type: 'error', payload }),
}));
jest.mock('pages/inside/common/launchFormFields/useCreateManualLaunch', () => ({
  ...jest.requireActual<object>('pages/inside/common/launchFormFields/useCreateManualLaunch'),
  createNewManualLaunch: (projectKey: string, dto: CreateManualLaunchDto) =>
    mockCreateNewManualLaunch(projectKey, dto),
}));

type HookResult = ReturnType<typeof useCreateManualLaunchFromList>;

describe('useCreateManualLaunchFromList', () => {
  let container: HTMLDivElement;
  let root: Root;
  let hook: HookResult;
  const onSuccess = jest.fn();

  const HookHost = ({ onRender }: { onRender: (result: HookResult) => void }) => {
    const result = useCreateManualLaunchFromList(onSuccess);

    useEffect(() => onRender(result));

    return null;
  };

  const formValues: LaunchFormData = {
    name: 'it2 launch',
    description: '  Regression run  ',
    attributes: [{ key: 'os', value: 'linux' }],
    testPlan: { id: 17, name: 'it2 plan' },
  };

  beforeAll(() => {
    (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    container = document.createElement('div');
    root = createRoot(container);
    act(() =>
      root.render(
        <HookHost
          onRender={(result) => {
            hook = result;
          }}
        />,
      ),
    );
  });

  afterEach(() => {
    act(() => root.unmount());
  });

  it('creates the launch with the selected Test Plan and no test cases', async () => {
    mockCreateNewManualLaunch.mockResolvedValue(undefined);

    await act(() => hook.handleSubmit(formValues));

    expect(mockCreateNewManualLaunch).toHaveBeenCalledWith(
      'my-organization.it2',
      expect.objectContaining({
        name: 'it2 launch',
        description: 'Regression run',
        testCaseIds: [],
        testPlan: { id: 17 },
        attributes: [{ key: 'os', value: 'linux' }],
      }),
    );
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'success',
        payload: { message: 'Launch "{launchName}" has been created successfully' },
      }),
    );
    expect(mockDispatch).toHaveBeenCalledWith({ type: 'hideModal' });
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(hook.isLoading).toBe(false);
  });

  it('sends no Test Plan when none is selected', async () => {
    mockCreateNewManualLaunch.mockResolvedValue(undefined);

    await act(() => hook.handleSubmit({ ...formValues, testPlan: undefined }));

    expect(mockCreateNewManualLaunch.mock.calls[0][1]).not.toHaveProperty('testPlan');
  });

  it('keeps the modal open and shows the server error when creation fails', async () => {
    mockCreateNewManualLaunch.mockRejectedValue({ message: 'Server error' });

    await act(() => hook.handleSubmit(formValues));

    expect(mockDispatch).toHaveBeenCalledWith({
      type: 'error',
      payload: { message: 'Server error' },
    });
    expect(mockDispatch).not.toHaveBeenCalledWith({ type: 'hideModal' });
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
