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

import { shallow } from 'enzyme';
import { useDispatch, useSelector, useStore } from 'react-redux';

import { useModal } from 'common/hooks';
import type { ReducedPipeline } from 'controllers/aiFactory/pipelines';

import {
  LivePipelineSettingsButton,
  LivePipelineSettingsModalContent,
  selectLivePipelineSettings,
} from './livePipelineSettings';
import type { PipelineSettingsState } from './pipelineSettingsProvenance';

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
jest.mock('common/hooks', () => ({ useModal: jest.fn() }));
jest.mock('common/utils', () => ({
  createClassnames:
    () =>
    (...classNames: string[]) =>
      classNames.filter(Boolean).join(' '),
}));
jest.mock('controllers/aiFactory/pipelines', () => ({
  isReducedPipeline: (pipeline: ReducedPipeline) => pipeline.kind === 'reduced',
  pipelineCatalogProjectKeySelector: (state: PipelineSettingsState) =>
    state.aiFactoryPipelines?.catalogProjectKey ?? null,
  pipelineCatalogTransportSelector: (state: PipelineSettingsState) =>
    state.aiFactoryPipelines?.transport ?? 'mock',
  pipelinesSelector: (state: PipelineSettingsState) => state.aiFactoryPipelines?.data ?? null,
}));
jest.mock('controllers/project', () => ({
  projectKeySelector: (state: PipelineSettingsState) => state.project?.info?.projectKey ?? '',
}));
jest.mock('controllers/modal', () => ({
  hideModalAction: () => ({ type: 'HIDE_MODAL' }),
  withModal: () => (component: unknown) => component,
}));

const pipeline: ReducedPipeline = {
  kind: 'reduced',
  id: 7,
  name: 'Generation',
  type: 'TEST_CASE_GENERATION',
  autoReady: { enabled: true, threshold: 90 },
};

const createState = (
  projectKey = 'project_a',
  currentPipeline: ReducedPipeline = pipeline,
): PipelineSettingsState => ({
  project: { info: { projectKey } },
  aiFactoryPipelines: {
    data: [currentPipeline],
    transport: 'live',
    catalogVersion: 1,
    catalogRequestId: 1,
    catalogProjectKey: 'project_a',
    iterationsByPipeline: null,
    iterationsLoadingByPipeline: {},
    iterationsErrorByPipeline: {},
    iterationRequestIdByPipeline: {},
    iterationDetails: null,
    comparison: null,
  },
});

describe('live pipeline settings', () => {
  let state: PipelineSettingsState;
  const openModal = jest.fn();
  const dispatch = jest.fn();

  beforeEach(() => {
    state = createState();
    jest.mocked(useSelector).mockImplementation((selector) => selector(state));
    jest.mocked(useStore).mockReturnValue({ getState: () => state } as never);
    jest.mocked(useDispatch).mockReturnValue(dispatch);
    jest.mocked(useModal).mockReturnValue({ openModal } as never);
    openModal.mockClear();
    dispatch.mockClear();
  });

  test('uses only the matching live catalog and current project', () => {
    expect(selectLivePipelineSettings(state, { pipelineId: 7, projectKey: 'project_a' })).toBe(
      pipeline,
    );
    expect(
      selectLivePipelineSettings(state, { pipelineId: 8, projectKey: 'project_a' }),
    ).toBeNull();
    expect(
      selectLivePipelineSettings(state, { pipelineId: 7, projectKey: 'project_b' }),
    ).toBeNull();
    expect(
      selectLivePipelineSettings(createState('project_b'), {
        pipelineId: 7,
        projectKey: 'project_b',
      }),
    ).toBeNull();
    if (state.aiFactoryPipelines) state.aiFactoryPipelines.transport = 'mock';
    expect(
      selectLivePipelineSettings(state, { pipelineId: 7, projectKey: 'project_a' }),
    ).toBeNull();
  });

  test('opens the live read-only modal only while the matching catalog is current', () => {
    const wrapper = shallow(<LivePipelineSettingsButton pipelineId={7} />);
    const button = wrapper.find('Button');
    expect(button.prop('disabled')).toBe(false);
    state = createState('project_b');
    (button.prop('onClick') as () => void)();
    expect(openModal).not.toHaveBeenCalled();
    state = createState();
    (button.prop('onClick') as () => void)();
    expect(openModal).toHaveBeenCalledWith({ pipelineId: 7, projectKey: 'project_a' });
  });

  test('shows the API values without a save action', () => {
    const wrapper = shallow(
      <LivePipelineSettingsModalContent data={{ pipelineId: 7, projectKey: 'project_a' }} />,
    );
    expect(wrapper.find('Modal').prop('okButton')).toBeUndefined();
    expect(wrapper.find('Toggle').props()).toMatchObject({ value: true, disabled: true });
    expect(wrapper.find('FieldText').props()).toMatchObject({ value: '90', disabled: true });
    expect(wrapper.find('SystemMessage').text()).toContain('Saving is not available yet');
  });

  test('does not treat missing API settings as disabled Auto-Ready', () => {
    state = createState('project_a', { ...pipeline, autoReady: undefined });
    const wrapper = shallow(
      <LivePipelineSettingsModalContent data={{ pipelineId: 7, projectKey: 'project_a' }} />,
    );
    expect(wrapper.find('Toggle')).toHaveLength(0);
    expect(wrapper.find('FieldText')).toHaveLength(0);
    expect(wrapper.find('SystemMessage').text()).toContain('did not provide Auto-Ready settings');
  });
});
