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

import { act, type ChangeEvent, type ComponentProps, type MouseEvent, type ReactNode } from 'react';
import { mount, shallow } from 'enzyme';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { Button, FieldText, Modal, SystemMessage, Toggle } from '@reportportal/ui-kit';

import { useModal } from 'common/hooks';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import type { ReducedPipeline } from 'controllers/aiFactory/pipelines';
import { useUserPermissions } from 'hooks/useUserPermissions';

import {
  LivePipelineSettingsButton,
  LivePipelineSettingsModalContent,
  selectLivePipelineSettings,
} from './livePipelineSettings';
import type { PipelineSettingsState } from './pipelineSettingsProvenance';

jest.mock('@reportportal/ui-kit', () => ({
  Button: () => <button type="button" />,
  ConfigurationIcon: () => null,
  FieldText: () => <input />,
  Modal: ({ children }: { children: ReactNode }) => <section>{children}</section>,
  SystemMessage: ({ children }: { children: ReactNode }) => <p>{children}</p>,
  Toggle: () => <input type="checkbox" />,
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
  fetch: jest.fn(),
  createClassnames:
    () =>
    (...classNames: string[]) =>
      classNames.filter(Boolean).join(' '),
}));
jest.mock('controllers/aiFactory/pipelines', () => ({
  adaptLivePipeline: jest.requireActual<
    typeof import('controllers/aiFactory/pipelines/liveAdapters')
  >('controllers/aiFactory/pipelines/liveAdapters').adaptLivePipeline,
  getPipelinesAction: jest.fn(() => ({ type: 'GET_PIPELINES' })),
  isReducedPipeline: (pipeline: ReducedPipeline) => pipeline.kind === 'reduced',
  pipelineCatalogProjectKeySelector: (state: PipelineSettingsState) =>
    state.aiFactoryPipelines?.catalogProjectKey ?? null,
  pipelineCatalogRequestSelector: () => null,
  pipelineCatalogTransportSelector: (state: PipelineSettingsState) =>
    state.aiFactoryPipelines?.transport ?? 'mock',
  pipelinesSelector: (state: PipelineSettingsState) => state.aiFactoryPipelines?.data ?? null,
}));
jest.mock('controllers/pages', () => ({
  currentPathSelector: () => '',
  pipelineIdSelector: () => null,
}));
jest.mock('hooks/useUserPermissions', () => ({ useUserPermissions: jest.fn() }));
jest.mock('pages/inside/aiFactory/common/aiDetailsSectionState', () => ({
  AiDetailsSectionState: ({ children }: { children: ReactNode }) => <section>{children}</section>,
}));
jest.mock('controllers/project', () => ({
  projectKeySelector: (state: PipelineSettingsState) => state.project?.info?.projectKey ?? '',
}));
jest.mock('controllers/modal', () => ({
  hideModalAction: () => ({ type: 'HIDE_MODAL' }),
  withModal: () => (component: unknown) => component,
}));
jest.mock('controllers/notification', () => ({
  showSuccessNotification: () => ({ type: 'SHOW_SUCCESS' }),
}));

const pipeline: ReducedPipeline = {
  kind: 'reduced',
  id: 7,
  name: 'Generation',
  type: 'TEST_CASE_GENERATION',
  autoReady: { enabled: true, threshold: 90 },
};

const detailResponse = { id: 7, name: 'Generation', type: 'TEST_CASE_GENERATION' };
const savedDetail = {
  ...detailResponse,
  settings: { autoReady: { enabled: true, threshold: 0 } },
};
const url = URLS.pipelineById('project_a', 7);
const fetchMock = jest.mocked(fetch as (url: string, options?: object) => Promise<unknown>);
type ModalAction = ComponentProps<typeof Modal>['okButton'];
type ModalWrapper = ReturnType<typeof mount> & { update: () => void };

const confirmSave = (view: ModalWrapper) =>
  act(() => {
    const save = view.find(Modal).prop('okButton') as ModalAction;
    save?.onClick?.({} as MouseEvent<HTMLButtonElement>);
    return Promise.resolve();
  });

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
  let wrapper: ReturnType<typeof mount> | undefined;

  const renderModal = async (
    detail: unknown = detailResponse,
    canManagePipelineSettings = true,
  ) => {
    jest.mocked(useUserPermissions).mockReturnValue({
      canManagePipelineSettings,
    } as ReturnType<typeof useUserPermissions>);
    fetchMock.mockResolvedValueOnce(detail);
    const view = mount(
      <LivePipelineSettingsModalContent data={{ pipelineId: 7, projectKey: 'project_a' }} />,
    ) as ModalWrapper;
    wrapper = view;
    await act(async () => {});
    view.update();
    return view;
  };

  beforeEach(() => {
    state = createState();
    jest.mocked(useSelector).mockImplementation((selector) => selector(state));
    jest.mocked(useStore).mockReturnValue({ getState: () => state } as never);
    jest.mocked(useDispatch).mockReturnValue(dispatch);
    jest.mocked(useModal).mockReturnValue({ openModal } as never);
    openModal.mockClear();
    dispatch.mockClear();
    fetchMock.mockReset();
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
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

  test('opens the live modal only while the matching catalog is current', () => {
    const wrapper = shallow(<LivePipelineSettingsButton pipelineId={7} />);
    const button = wrapper.find(Button);
    expect(button.prop('disabled')).toBe(false);
    state = createState('project_b');
    (button.prop('onClick') as () => void)();
    expect(openModal).not.toHaveBeenCalled();
    state = createState();
    (button.prop('onClick') as () => void)();
    expect(openModal).toHaveBeenCalledWith({ pipelineId: 7, projectKey: 'project_a' });
  });

  test('reads the saved values from the detail API and remains read-only without permission', async () => {
    const view = await renderModal(
      { ...detailResponse, settings: { autoReady: { enabled: true, threshold: 84 } } },
      false,
    );

    expect(fetchMock).toHaveBeenCalledWith(
      url,
      expect.objectContaining({ signal: expect.anything() }),
    );
    expect(view.find(Modal).prop('okButton')).toBeUndefined();
    expect(view.find(Toggle).props()).toMatchObject({ value: true, disabled: true });
    expect(view.find(FieldText).props()).toMatchObject({ value: '84', disabled: true });
  });

  test('shows Auto-Ready as off with an empty threshold when settings are absent', async () => {
    const view = await renderModal();

    expect(view.find(Toggle).prop('value')).toBe(false);
    expect(view.find(FieldText).prop('value')).toBe('');
    expect(view.find(SystemMessage)).toHaveLength(0);
  });

  test('shows an unavailable state and prevents editing malformed data', async () => {
    const view = await renderModal({
      ...detailResponse,
      settings: { autoReady: { enabled: true } },
    });

    expect(view.find(Modal).prop('okButton')).toBeUndefined();
    expect(view.find(Toggle)).toHaveLength(0);
    expect(view.find(SystemMessage).prop('children')).toContain(
      'The API did not provide Auto-Ready settings',
    );
  });

  test('saves a nested setting and confirms it with a new GET', async () => {
    const view = await renderModal();
    fetchMock.mockResolvedValueOnce(savedDetail).mockResolvedValueOnce(savedDetail);

    act(() => {
      const onChange = view.find(Toggle).prop('onChange') as ComponentProps<
        typeof Toggle
      >['onChange'];
      onChange?.({ target: { checked: true } } as ChangeEvent<HTMLInputElement>);
    });
    view.update();
    expect((view.find(Modal).prop('okButton') as ModalAction)?.disabled).toBe(true);
    act(() => {
      const onChange = view.find(FieldText).prop('onChange') as ComponentProps<
        typeof FieldText
      >['onChange'];
      onChange?.({ target: { value: '0' } } as ChangeEvent<HTMLInputElement>);
    });
    view.update();

    await confirmSave(view);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      url,
      expect.objectContaining({
        method: 'PATCH',
        data: { settings: { autoReady: { enabled: true, threshold: 0 } } },
      }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      url,
      expect.not.objectContaining({ method: 'PATCH' }),
    );
    expect(dispatch).toHaveBeenCalledWith({ type: 'SHOW_SUCCESS' });
  });

  test('clears a saved setting with null and verifies its absence', async () => {
    const view = await renderModal(savedDetail);
    fetchMock.mockResolvedValueOnce(detailResponse).mockResolvedValueOnce(detailResponse);

    act(() => {
      const reset = view.find(Button).prop('onClick') as ComponentProps<typeof Button>['onClick'];
      reset?.({} as MouseEvent<HTMLButtonElement>);
    });
    view.update();
    await confirmSave(view);

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      url,
      expect.objectContaining({ method: 'PATCH', data: { settings: { autoReady: null } } }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      url,
      expect.not.objectContaining({ method: 'PATCH' }),
    );
    expect(dispatch).toHaveBeenCalledWith({ type: 'SHOW_SUCCESS' });
  });
});
