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
import { useDispatch, useSelector, useStore } from 'react-redux';
import { Button, FieldText, Modal, SystemMessage, Toggle } from '@reportportal/ui-kit';

import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { getPipelinesAction } from 'controllers/aiFactory/pipelines';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { PipelineRS, PipelineType } from 'types/aiFactory';

import { PipelineSettingsButton } from './pipelineSettingsButton';
import { PipelineSettingsModalContent } from './pipelineSettingsModal';
import {
  getPipelineSettingsProvenance,
  type PipelineSettingsState,
} from './pipelineSettingsProvenance';
import { usePipelineSettingsModal } from './usePipelineSettingsModal';

jest.mock('@reportportal/ui-kit', () => ({
  Button: 'Button',
  ConfigurationIcon: 'ConfigurationIcon',
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
jest.mock('react-redux', () => ({
  useDispatch: jest.fn(),
  useSelector: jest.fn(),
  useStore: jest.fn(),
}));
jest.mock('common/utils', () => ({
  createClassnames: () => (...classNames: string[]) => classNames.filter(Boolean).join(' '),
  fetch: jest.fn(),
}));
jest.mock('controllers/aiFactory/pipelines', () => {
  return {
    getPipelinesAction: jest.fn(() => ({ type: 'GET_PIPELINES' })),
    pipelineCatalogProjectKeySelector: (state: PipelineSettingsState) =>
      state.aiFactoryPipelines?.catalogProjectKey ?? null,
    pipelineCatalogRequestIdSelector: (state: PipelineSettingsState) =>
      state.aiFactoryPipelines?.catalogRequestId ?? null,
    pipelineCatalogTransportSelector: (state: PipelineSettingsState) =>
      state.aiFactoryPipelines?.transport ?? 'mock',
    pipelineCatalogVersionSelector: (state: PipelineSettingsState) =>
      state.aiFactoryPipelines?.catalogVersion ?? 0,
    pipelinesSelector: (state: PipelineSettingsState) => state.aiFactoryPipelines?.data ?? null,
  };
});
jest.mock('controllers/project', () => ({
  projectKeySelector: (state: PipelineSettingsState) => state.project?.info?.projectKey ?? '',
}));
jest.mock('controllers/modal', () => ({
  hideModalAction: () => ({ type: 'HIDE_MODAL' }),
  withModal: () => (component: unknown) => component,
}));
jest.mock('controllers/notification', () => ({
  showErrorNotification: (payload: unknown) => ({ type: 'ERROR', payload }),
  showSuccessNotification: (payload: unknown) => ({ type: 'SUCCESS', payload }),
}));
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

const createSettingsState = (
  projectKey: string,
  pipeline: PipelineRS,
  transport: 'mock' | 'live' = 'mock',
  catalogVersion = 1,
  catalogRequestId = 1,
): PipelineSettingsState => ({
  project: { info: { projectKey } },
  aiFactoryPipelines: {
    data: [pipeline],
    transport,
    catalogVersion,
    catalogRequestId,
    catalogProjectKey: projectKey,
    iterationsByPipeline: null,
    iterationsLoadingByPipeline: {},
    iterationsErrorByPipeline: {},
    iterationRequestIdByPipeline: {},
    iterationDetails: null,
    comparison: null,
  },
});

let storeState: PipelineSettingsState;

const renderModal = (
  pipeline = generationPipeline,
  canManagePipelineSettings = true,
  transport: 'mock' | 'live' = 'mock',
  catalogVersion = 1,
  catalogProjectKey: string | null = 'demo_project',
  catalogRequestId = 1,
  projectKey = 'demo_project',
) => {
  storeState = createSettingsState(
    projectKey,
    pipeline,
    transport,
    catalogVersion,
    catalogRequestId,
  );
  storeState.aiFactoryPipelines = {
    ...storeState.aiFactoryPipelines,
    catalogProjectKey,
  };
  const provenance = getPipelineSettingsProvenance(storeState, pipeline) ?? undefined;
  jest.mocked(useDispatch).mockReturnValue(dispatch);
  jest
    .mocked(useSelector)
    .mockImplementation(((selector: (state: PipelineSettingsState) => unknown) =>
      selector(storeState)) as typeof useSelector);
  jest.mocked(useStore).mockReturnValue({
    getState: () => storeState,
  } as ReturnType<typeof useStore>);
  jest.mocked(useUserPermissions).mockReturnValue({
    canManagePipelineSettings,
  } as ReturnType<typeof useUserPermissions>);

  return shallow(<PipelineSettingsModalContent data={{ pipeline, provenance }} />);
};

describe('pipeline settings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(usePipelineSettingsModal).mockReturnValue({ openModal });
    storeState = createSettingsState('demo_project', generationPipeline);
    jest.mocked(useStore).mockReturnValue({
      getState: () => storeState,
    } as ReturnType<typeof useStore>);
  });

  test('opens the global modal with the selected pipeline', () => {
    const wrapper = shallow(<PipelineSettingsButton pipeline={generationPipeline} />);
    const onClick = wrapper.find(Button).prop('onClick') as () => void;

    onClick();

    expect(openModal).toHaveBeenCalledWith({
      pipeline: generationPipeline,
      provenance: {
        projectKey: 'demo_project',
        catalogTransport: 'mock',
        catalogVersion: 1,
        catalogRequestId: 1,
      },
    });
  });

  test('PATCHes LP5 using live field names and refreshes the pipeline list', async () => {
    fetchMock.mockResolvedValue({});
    const wrapper = renderModal(
      generationPipeline,
      true,
      'mock',
      1,
      'project_a',
      7,
      'project_a',
    );

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

    expect(fetchMock).toHaveBeenCalledWith(URLS.pipelineById('project_a', 1), {
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

  test('refuses the settings save request boundary for a non-mock catalog', () => {
    const wrapper = renderModal(generationPipeline, true, 'live');

    expect(wrapper.find(Modal).prop('okButton')).toBeUndefined();
    expect(wrapper.find(SystemMessage)).toHaveLength(1);
    expect(wrapper.find(Toggle).prop('disabled')).toBe(true);
    expect(wrapper.find(FieldText).prop('disabled')).toBe(true);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test.each([
    ['unresolved catalog', 0, 'demo_project'],
    ['catalog from another project', 1, 'other_project'],
  ])('refuses settings save for %s', (_description, version, catalogProjectKey) => {
    const wrapper = renderModal(generationPipeline, true, 'mock', version, catalogProjectKey);

    expect(wrapper.find(Modal).prop('okButton')).toBeUndefined();
    expect(wrapper.find(SystemMessage)).toHaveLength(1);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  test('stays read-only and refuses a captured save after navigation to another catalog', async () => {
    const wrapper = renderModal(
      generationPipeline,
      true,
      'mock',
      9,
      'project_a',
      11,
      'project_a',
    );
    act(() => {
      const onChange = wrapper.find(Toggle).prop('onChange') as (
        event: { target: { checked: boolean } },
      ) => void;
      onChange({ target: { checked: false } });
    });
    const capturedSave = (wrapper.find(Modal).prop('okButton') as ModalButtonProps).onClick;
    const projectBPipeline = { ...generationPipeline };

    storeState = createSettingsState('project_b', projectBPipeline, 'mock', 9, 11);
    wrapper.setProps({});

    expect(wrapper.find(Modal).prop('okButton')).toBeUndefined();
    expect(wrapper.find(SystemMessage)).toHaveLength(1);

    await act(async () => {
      capturedSave?.();
      await Promise.resolve();
    });
    expect(fetchMock).not.toHaveBeenCalled();
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
