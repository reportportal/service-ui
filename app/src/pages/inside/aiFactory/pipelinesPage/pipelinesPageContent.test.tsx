/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { shallow, type ShallowWrapper } from 'enzyme';
import { useDispatch, useSelector } from 'react-redux';

import { isAiFactoryDemoResetAvailable } from 'controllers/aiFactory';
import { isAiFactoryMockRuntimeInstalled, resetMockDb } from 'controllers/aiFactory/mocks';
import {
  getPipelineIterationsAction,
  getPipelinesAction,
  pipelineCatalogTransportSelector,
  pipelineIterationsByPipelineSelector,
  pipelineIterationsErrorByPipelineSelector,
  pipelineIterationsLoadingByPipelineSelector,
  pipelinesLoadingSelector,
  pipelinesSelector,
} from 'controllers/aiFactory/pipelines';
import { showModalAction } from 'controllers/modal';
import { showErrorNotification, showSuccessNotification } from 'controllers/notification';
import { urlOrganizationAndProjectSelector } from 'controllers/pages';
import { projectNameSelector } from 'controllers/project';
import { POLLING_REQUEST_STARTED, usePolling } from 'pages/inside/aiFactory/common';
import {
  IterationStatus,
  PipelineType,
  type IterationSummaryRS,
  type PipelineRS,
} from 'types/aiFactory';

import { PipelinesPageContent } from './pipelinesPageContent';

jest.mock('@reportportal/ui-kit', () => ({
  Button: 'Button',
  RefreshIcon: 'RefreshIcon',
}));
jest.mock(
  'react-intl',
  () =>
    jest.requireActual<typeof import('../aiFactoryTestUtils')>(
      'pages/inside/aiFactory/aiFactoryTestUtils',
    ).reactIntlTestMock,
);
jest.mock('react-redux', () => ({ useDispatch: jest.fn(), useSelector: jest.fn() }));
jest.mock('controllers/aiFactory', () => ({ isAiFactoryDemoResetAvailable: jest.fn() }));
jest.mock('controllers/aiFactory/mocks', () => ({
  isAiFactoryMockRuntimeInstalled: jest.fn(),
  resetMockDb: jest.fn(),
}));
jest.mock('common/utils', () => ({
  createClassnames:
    () =>
    (...classNames: string[]) =>
      classNames.filter(Boolean).join(' '),
}));
jest.mock('components/fields/searchField', () => ({ SearchField: 'SearchField' }));
jest.mock('components/main/scrollWrapper', () => ({ ScrollWrapper: 'ScrollWrapper' }));
jest.mock('components/preloaders/spinningPreloader', () => ({
  SpinningPreloader: 'SpinningPreloader',
}));
jest.mock('controllers/aiFactory/pipelines', () => ({
  getPipelineIterationsAction: jest.fn((pipelineIds: number[]) => ({
    type: 'GET_PIPELINE_ITERATIONS',
    payload: { pipelineIds },
  })),
  getPipelinesAction: jest.fn(() => ({ type: 'GET_PIPELINES' })),
  isReducedPipeline: jest.fn(
    (pipeline: unknown) => typeof pipeline === 'object' && pipeline !== null && 'kind' in pipeline,
  ),
  isReducedPipelineIteration: jest.fn(
    (iteration: unknown) =>
      typeof iteration === 'object' && iteration !== null && 'kind' in iteration,
  ),
  pipelineCatalogTransportSelector: jest.fn(),
  pipelineIterationsByPipelineSelector: jest.fn(),
  pipelineIterationsErrorByPipelineSelector: jest.fn(),
  pipelineIterationsLoadingByPipelineSelector: jest.fn(),
  pipelinesLoadingSelector: jest.fn(),
  pipelinesSelector: jest.fn(),
}));
jest.mock('controllers/pages', () => ({
  PROJECT_DASHBOARD_PAGE: 'PROJECT_DASHBOARD_PAGE',
  PROJECT_PIPELINE_COMPARISON_PAGE: 'PROJECT_PIPELINE_COMPARISON_PAGE',
  urlOrganizationAndProjectSelector: jest.fn(),
}));
jest.mock('controllers/project', () => ({ projectNameSelector: jest.fn() }));
jest.mock('controllers/modal', () => ({
  showModalAction: jest.fn((payload: unknown) => ({ type: 'SHOW_MODAL', payload })),
}));
jest.mock('controllers/notification', () => ({
  showErrorNotification: jest.fn((payload: unknown) => ({ type: 'ERROR', payload })),
  showSuccessNotification: jest.fn((payload: unknown) => ({ type: 'SUCCESS', payload })),
}));
jest.mock('layouts/settingsLayout', () => ({ SettingsLayout: 'SettingsLayout' }));
jest.mock('pages/inside/aiFactory/common', () => ({
  POLLING_REQUEST_STARTED: 'POLLING_REQUEST_STARTED',
  usePolling: jest.fn(),
}));
jest.mock('../../common/pageHeaderWithBreadcrumbsAndActions', () => ({
  PageHeaderWithBreadcrumbsAndActions: 'PageHeaderWithBreadcrumbsAndActions',
}));
jest.mock('./pipelineGroup', () => ({ PipelineGroup: 'PipelineGroup' }));

const dispatch = jest.fn();
const generationPipeline: PipelineRS = {
  id: 1,
  type: PipelineType.GENERATION,
  name: 'Generation',
  repository: 'repo',
  iterationsCount: 1,
};
const automationPipeline: PipelineRS = {
  id: 2,
  type: PipelineType.AUTOMATION,
  name: 'Automation',
  repository: 'repo',
  iterationsCount: 1,
};

const createIteration = (pipelineId: number, status: IterationStatus): IterationSummaryRS =>
  ({
    id: pipelineId * 100,
    pipelineId,
    number: 1,
    status,
    trigger: 'CI',
  }) as IterationSummaryRS;

interface RenderOptions {
  pipelines?: PipelineRS[];
  iterationsByPipeline?: Record<number, IterationSummaryRS[]>;
  pipelinesLoading?: boolean;
  iterationsLoadingByPipeline?: Record<number, boolean>;
  iterationsErrorByPipeline?: Record<number, boolean>;
  transport?: 'mock' | 'live';
}

let selectorValues: Map<unknown, unknown>;

interface PipelineGroupTestProps {
  pipeline: PipelineRS;
  isLoading: boolean;
  hasError: boolean;
  onRetry: () => void;
}

interface PipelineGroupTestNode {
  props: () => PipelineGroupTestProps;
}

interface PipelineGroupTestCollection {
  at: (index: number) => PipelineGroupTestNode;
}

const renderPage = ({
  pipelines = [generationPipeline, automationPipeline],
  iterationsByPipeline = {},
  pipelinesLoading = false,
  iterationsLoadingByPipeline = {},
  iterationsErrorByPipeline = {},
  transport = 'mock',
}: RenderOptions = {}): ShallowWrapper => {
  selectorValues = new Map<unknown, unknown>([
    [projectNameSelector, 'Demo'],
    [urlOrganizationAndProjectSelector, { organizationSlug: 'org', projectSlug: 'project' }],
    [pipelinesSelector, pipelines],
    [pipelinesLoadingSelector, pipelinesLoading],
    [pipelineIterationsByPipelineSelector, iterationsByPipeline],
    [pipelineIterationsLoadingByPipelineSelector, iterationsLoadingByPipeline],
    [pipelineIterationsErrorByPipelineSelector, iterationsErrorByPipeline],
    [pipelineCatalogTransportSelector, transport],
  ]);
  jest.mocked(useDispatch).mockReturnValue(dispatch as unknown as ReturnType<typeof useDispatch>);
  jest
    .mocked(useSelector)
    .mockImplementation(((selector: unknown) =>
      selectorValues.get(selector)) as typeof useSelector);

  return shallow(<PipelinesPageContent />);
};

const getHeaderActions = (wrapper: ShallowWrapper): ShallowWrapper =>
  wrapper.find('[data-automation-id="pipelinesToolbar"]');

const clickResetButton = (actions: ShallowWrapper) =>
  (actions.find('[data-automation-id="resetAiFactoryDemoButton"]').prop('onClick') as () => void)();

describe('PipelinesPageContent polling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(isAiFactoryDemoResetAvailable).mockReturnValue(false);
    jest.mocked(isAiFactoryMockRuntimeInstalled).mockReturnValue(true);
    jest.mocked(resetMockDb).mockReturnValue(true);
  });

  test('polls all pipeline summaries every 5 seconds while automation is running', () => {
    const wrapper = renderPage({
      iterationsByPipeline: {
        1: [createIteration(1, IterationStatus.COMPLETED)],
        2: [createIteration(2, IterationStatus.RUNNING)],
      },
    });
    const poll = jest.mocked(usePolling).mock.calls.at(-1)?.[0];

    expect(usePolling).toHaveBeenLastCalledWith(expect.any(Function), 5000, true);
    expect(poll?.()).toBe(POLLING_REQUEST_STARTED);
    expect(getPipelineIterationsAction).toHaveBeenLastCalledWith([1, 2]);
    expect(dispatch).toHaveBeenLastCalledWith({
      type: 'GET_PIPELINE_ITERATIONS',
      payload: { pipelineIds: [1, 2] },
    });
    wrapper.unmount();
  });

  test('re-arms polling after loading completes without duplicate dispatches', () => {
    const wrapper = renderPage({
      pipelines: [automationPipeline],
      iterationsByPipeline: { 2: [createIteration(2, IterationStatus.RUNNING)] },
    });
    const firstPoll = jest.mocked(usePolling).mock.calls.at(-1)?.[0];

    expect(firstPoll?.()).toBe(POLLING_REQUEST_STARTED);
    expect(dispatch).toHaveBeenCalledTimes(1);

    selectorValues.set(pipelineIterationsLoadingByPipelineSelector, { 2: true });
    wrapper.setProps({});
    expect(usePolling).toHaveBeenLastCalledWith(expect.any(Function), 5000, false);
    expect(dispatch).toHaveBeenCalledTimes(1);

    selectorValues.set(pipelineIterationsLoadingByPipelineSelector, { 2: false });
    wrapper.setProps({});
    const rearmedPoll = jest.mocked(usePolling).mock.calls.at(-1)?.[0];
    expect(usePolling).toHaveBeenLastCalledWith(expect.any(Function), 5000, true);
    expect(rearmedPoll?.()).toBe(POLLING_REQUEST_STARTED);
    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(getPipelineIterationsAction).toHaveBeenCalledTimes(2);
    wrapper.unmount();
  });

  test('does not poll forever for a generation-only running iteration', () => {
    const wrapper = renderPage({
      pipelines: [generationPipeline],
      iterationsByPipeline: { 1: [createIteration(1, IterationStatus.RUNNING)] },
    });

    expect(usePolling).toHaveBeenLastCalledWith(expect.any(Function), 5000, false);
    wrapper.unmount();
  });

  test.each([IterationStatus.COMPLETED, IterationStatus.FAILED])(
    'stops polling after automation reaches %s',
    (status) => {
      const wrapper = renderPage({
        pipelines: [automationPipeline],
        iterationsByPipeline: { 2: [createIteration(2, status)] },
      });

      expect(usePolling).toHaveBeenLastCalledWith(expect.any(Function), 5000, false);
      wrapper.unmount();
    },
  );

  test.each([
    { pipelinesLoading: true, iterationsLoadingByPipeline: {} },
    { pipelinesLoading: false, iterationsLoadingByPipeline: { 2: true } },
  ])('pauses polling while data is loading %#', (loadingState) => {
    const wrapper = renderPage({
      ...loadingState,
      pipelines: [automationPipeline],
      iterationsByPipeline: { 2: [createIteration(2, IterationStatus.RUNNING)] },
    });

    expect(usePolling).toHaveBeenLastCalledWith(expect.any(Function), 5000, false);
    wrapper.unmount();
  });

  test('keeps rich mock pipelines rendered with independent loading and error states', () => {
    const wrapper = renderPage({
      iterationsByPipeline: {
        1: [createIteration(1, IterationStatus.COMPLETED)],
        2: [createIteration(2, IterationStatus.FAILED)],
      },
      iterationsLoadingByPipeline: { 1: true, 2: false },
      iterationsErrorByPipeline: { 1: false, 2: true },
    });
    const groups = wrapper.find('PipelineGroup');
    const testGroups = groups as unknown as PipelineGroupTestCollection;

    expect(groups).toHaveLength(2);
    expect(testGroups.at(0).props()).toMatchObject({
      pipeline: generationPipeline,
      isLoading: true,
      hasError: false,
    });
    expect(testGroups.at(1).props()).toMatchObject({
      pipeline: automationPipeline,
      isLoading: false,
      hasError: true,
    });
    wrapper.unmount();
  });

  test('retries only the failed pipeline group', () => {
    const wrapper = renderPage({ iterationsErrorByPipeline: { 2: true } });
    const groups = wrapper.find('PipelineGroup') as unknown as PipelineGroupTestCollection;

    groups.at(1).props().onRetry();

    expect(getPipelineIterationsAction).toHaveBeenLastCalledWith([2]);
    expect(dispatch).toHaveBeenLastCalledWith({
      type: 'GET_PIPELINE_ITERATIONS',
      payload: { pipelineIds: [2] },
    });
    wrapper.unmount();
  });

  test('does not poll mock endpoints when catalog provenance is live', () => {
    const wrapper = renderPage({
      transport: 'live',
      pipelines: [automationPipeline],
      iterationsByPipeline: { 2: [createIteration(2, IterationStatus.RUNNING)] },
    });

    expect(usePolling).toHaveBeenLastCalledWith(expect.any(Function), 5000, false);
    wrapper.unmount();
  });

});

describe('PipelinesPageContent demo reset', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(isAiFactoryDemoResetAvailable).mockReturnValue(true);
    jest.mocked(isAiFactoryMockRuntimeInstalled).mockReturnValue(true);
    jest.mocked(resetMockDb).mockReturnValue(true);
  });

  test('does not render reset when the guarded mock mode is unavailable', () => {
    jest.mocked(isAiFactoryDemoResetAvailable).mockReturnValue(false);

    const wrapper = renderPage();
    const actions = getHeaderActions(wrapper);

    expect(actions.find('[data-automation-id="resetAiFactoryDemoButton"]')).toHaveLength(0);
    wrapper.unmount();
  });

  test('renders a disabled reset action while pipelines are loading', () => {
    const wrapper = renderPage({ pipelinesLoading: true });
    const actions = getHeaderActions(wrapper);

    expect(actions.find('[data-automation-id="resetAiFactoryDemoButton"]').prop('disabled')).toBe(
      true,
    );
    wrapper.unmount();
  });

  test('keeps the pipeline search field visibly expanded', () => {
    const wrapper = renderPage();
    const searchField = getHeaderActions(wrapper).find('SearchField');

    expect(searchField.props()).toMatchObject({
      isAlwaysActive: true,
      placeholder: 'Search by requirement, iteration # or pipeline name',
    });
    wrapper.unmount();
  });

  test('opens a destructive local-only confirmation', () => {
    const wrapper = renderPage();
    const actions = getHeaderActions(wrapper);

    clickResetButton(actions);

    expect(showModalAction).toHaveBeenCalledWith({
      id: 'confirmationModal',
      data: expect.objectContaining({
        title: 'Reset the AI Factory demo?',
        message:
          'This resets only local AI Factory demo data. It cannot undo changes already made in the real TMS.',
        dangerConfirm: true,
        onConfirm: expect.any(Function),
      }),
    });
    wrapper.unmount();
  });

  test('resets local state, clears search and refreshes only the pipeline catalog', async () => {
    const wrapper = renderPage();
    let actions = getHeaderActions(wrapper);
    const searchField = actions.find('SearchField');
    (searchField.prop('setSearchValue') as (value: string) => void)('changed');
    actions = getHeaderActions(wrapper);
    clickResetButton(actions);
    const modalPayload = jest.mocked(showModalAction).mock.calls[0][0] as {
      data: { onConfirm: () => void };
    };
    dispatch.mockClear();

    modalPayload.data.onConfirm();
    await Promise.resolve();
    await Promise.resolve();

    expect(resetMockDb).toHaveBeenCalledTimes(1);
    expect(getPipelinesAction).toHaveBeenCalledTimes(1);
    expect(showSuccessNotification).toHaveBeenCalledWith({
      message: 'The local AI Factory demo was reset.',
    });
    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(getHeaderActions(wrapper).find('SearchField').prop('searchValue')).toBe('');
    wrapper.unmount();
  });

  test.each([
    ['runtime is not installed', false, true],
    ['reset persistence fails', true, false],
  ])('reports an error and does not refresh when %s', async (_label, runtimeInstalled, resetOk) => {
    jest.mocked(isAiFactoryMockRuntimeInstalled).mockReturnValue(runtimeInstalled);
    jest.mocked(resetMockDb).mockReturnValue(resetOk);
    const wrapper = renderPage();
    const actions = getHeaderActions(wrapper);
    clickResetButton(actions);
    const modalPayload = jest.mocked(showModalAction).mock.calls[0][0] as {
      data: { onConfirm: () => void };
    };
    jest.mocked(getPipelinesAction).mockClear();

    modalPayload.data.onConfirm();
    await Promise.resolve();
    await Promise.resolve();

    expect(showErrorNotification).toHaveBeenCalledWith({
      message: 'The local AI Factory demo could not be reset.',
    });
    expect(getPipelinesAction).not.toHaveBeenCalled();
    wrapper.unmount();
  });

  test('rechecks the reset gate after loading the mock runtime', async () => {
    jest
      .mocked(isAiFactoryDemoResetAvailable)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(false);
    const wrapper = renderPage();
    const actions = getHeaderActions(wrapper);
    clickResetButton(actions);
    const modalPayload = jest.mocked(showModalAction).mock.calls[0][0] as {
      data: { onConfirm: () => void };
    };

    modalPayload.data.onConfirm();
    await Promise.resolve();
    await Promise.resolve();

    expect(resetMockDb).not.toHaveBeenCalled();
    expect(showErrorNotification).toHaveBeenCalledWith({
      message: 'The local AI Factory demo could not be reset.',
    });
    expect(getPipelinesAction).not.toHaveBeenCalled();
    wrapper.unmount();
  });
});
