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

import { act } from 'react';
import { shallow } from 'enzyme';
import { useDispatch, useSelector } from 'react-redux';
import { Button, FieldText, Modal, SystemMessage, Toggle } from '@reportportal/ui-kit';

import { fetch } from 'common/utils';
import { getPipelinesAction } from 'controllers/aiFactory/pipelines';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { PipelineRS, PipelineType } from 'types/aiFactory';

import { PipelineSettingsButton } from './pipelineSettingsButton';
import { PipelineSettingsModalContent } from './pipelineSettingsModal';
import { usePipelineSettingsModal } from './usePipelineSettingsModal';

jest.mock('@reportportal/ui-kit', () => ({
  Button: 'Button',
  FieldText: 'FieldText',
  Modal: 'Modal',
  SystemMessage: 'SystemMessage',
  Toggle: 'Toggle',
}));
jest.mock(
  'react-intl',
  () =>
    jest.requireActual<typeof import('../aiFactoryTestUtils')>(
      'pages/inside/aiFactory/aiFactoryTestUtils',
    ).reactIntlTestMock,
);
jest.mock('react-redux', () => ({ useDispatch: jest.fn(), useSelector: jest.fn() }));
jest.mock('common/utils', () => ({
  createClassnames: () => (...classNames: string[]) => classNames.filter(Boolean).join(' '),
  fetch: jest.fn(),
}));
jest.mock('controllers/aiFactory/pipelines', () => ({
  getPipelinesAction: jest.fn(() => ({ type: 'GET_PIPELINES' })),
}));
jest.mock('controllers/modal', () => ({
  hideModalAction: () => ({ type: 'HIDE_MODAL' }),
  withModal: () => (component: unknown) => component,
}));
jest.mock('controllers/notification', () => ({
  showErrorNotification: (payload: unknown) => ({ type: 'ERROR', payload }),
  showSuccessNotification: (payload: unknown) => ({ type: 'SUCCESS', payload }),
}));
jest.mock('controllers/project', () => ({ projectKeySelector: jest.fn() }));
jest.mock('hooks/useUserPermissions', () => ({ useUserPermissions: jest.fn() }));
jest.mock('./usePipelineSettingsModal', () => ({ usePipelineSettingsModal: jest.fn() }));

const dispatch = jest.fn();
const openModal = jest.fn();
const fetchMock = fetch as jest.MockedFunction<
  (url: string, params?: Record<string, unknown>) => Promise<unknown>
>;

interface ModalButtonProps {
  disabled?: boolean;
  onClick?: (event?: unknown) => void;
}

const generationPipeline: PipelineRS = {
  id: 1,
  type: PipelineType.GENERATION,
  name: 'Test case generation',
  repository: 'reportportal/tests',
  iterationsCount: 3,
  settings: { autoReady: true, threshold: 90, editable: true },
};

const renderModal = (pipeline = generationPipeline, canManagePipelineSettings = true) => {
  jest.mocked(useDispatch).mockReturnValue(dispatch);
  jest.mocked(useSelector).mockReturnValue('demo_project');
  jest.mocked(useUserPermissions).mockReturnValue({
    canManagePipelineSettings,
  } as ReturnType<typeof useUserPermissions>);

  return shallow(<PipelineSettingsModalContent data={{ pipeline }} />);
};

describe('pipeline settings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(usePipelineSettingsModal).mockReturnValue({ openModal });
  });

  test('opens the global modal with the selected pipeline', () => {
    const wrapper = shallow(<PipelineSettingsButton pipeline={generationPipeline} />);
    const onClick = wrapper.find(Button).prop('onClick') as () => void;

    onClick();

    expect(openModal).toHaveBeenCalledWith({ pipeline: generationPipeline });
  });

  test('PATCHes LP5 using live field names and refreshes the pipeline list', async () => {
    fetchMock.mockResolvedValue({});
    const wrapper = renderModal();

    act(() => {
      const onChange = wrapper.find(Toggle).prop('onChange') as (
        event: { target: { checked: boolean } },
      ) => void;
      onChange({ target: { checked: false } });
    });

    const okButton = wrapper.find(Modal).prop('okButton') as ModalButtonProps | undefined;
    expect(okButton?.disabled).toBe(false);

    await act(async () => {
      okButton?.onClick?.();
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/pipeline/1'), {
      method: 'PATCH',
      data: { autoReadyEnabled: false, autoReadyThreshold: 90 },
    });
    expect(getPipelinesAction).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({ type: 'GET_PIPELINES' });
    expect(dispatch).toHaveBeenCalledWith({ type: 'HIDE_MODAL' });
  });

  test('shows validation and prevents saving an invalid threshold', () => {
    const wrapper = renderModal();

    act(() => {
      const onChange = wrapper.find(FieldText).prop('onChange') as (
        event: { target: { value: string } },
      ) => void;
      onChange({ target: { value: '101' } });
    });

    expect(wrapper.find(FieldText).prop('error')).toBe(
      'Threshold must be a whole number from 0 to 100',
    );
    expect(wrapper.find(FieldText).prop('touched')).toBe(true);
    const okButton = wrapper.find(Modal).prop('okButton') as ModalButtonProps | undefined;
    expect(okButton?.disabled).toBe(true);
  });

  test('renders generation settings read-only without management permission', () => {
    const wrapper = renderModal(generationPipeline, false);

    expect(wrapper.find(Modal).prop('okButton')).toBeUndefined();
    expect(wrapper.find(SystemMessage)).toHaveLength(1);
    expect(wrapper.find(Toggle).prop('disabled')).toBe(true);
    expect(wrapper.find(FieldText).prop('disabled')).toBe(true);
  });

  test('explains that automation pipelines have no settings in the PoC', () => {
    const wrapper = renderModal({
      ...generationPipeline,
      id: 2,
      type: PipelineType.AUTOMATION,
      name: 'Test automation',
      settings: undefined,
    });

    expect(wrapper.find(Modal).text()).toContain('Test automation has no settings in the PoC.');
    expect(wrapper.find(Modal).prop('okButton')).toBeUndefined();
    expect(wrapper.find(Toggle)).toHaveLength(0);
  });
});
