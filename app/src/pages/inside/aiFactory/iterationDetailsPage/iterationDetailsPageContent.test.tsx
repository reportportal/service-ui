/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { mount, shallow } from 'enzyme';
import { useDispatch, useSelector } from 'react-redux';

import {
  getPipelineIterationDetailsAction,
  getPipelinesAction,
  pipelineCatalogProjectKeySelector,
  pipelineCatalogRequestIdSelector,
  pipelineCatalogTransportSelector,
  pipelineCatalogVersionSelector,
  pipelineIterationDetailsErrorSelector,
  pipelineIterationDetailsLoadingSelector,
  pipelineIterationDetailsSelector,
  pipelineIterationDetailsUnavailableSelector,
  pipelinesLoadingSelector,
  pipelinesSelector,
} from 'controllers/aiFactory/pipelines';
import {
  iterationIdSelector,
  pipelineIdSelector,
  querySelector,
  urlOrganizationAndProjectSelector,
} from 'controllers/pages';
import { projectKeySelector, projectNameSelector } from 'controllers/project';
import { POLLING_REQUEST_STARTED, usePolling } from 'pages/inside/aiFactory/common';
import { IterationStatus, PipelineType, type IterationRS, type PipelineRS } from 'types/aiFactory';

import { IterationDetailsPageContent } from './iterationDetailsPageContent';
import { ReducedIterationDetails } from './reducedIterationDetails';

jest.mock('@reportportal/ui-kit', () => ({
  Button: 'Button',
  RefreshIcon: 'RefreshIcon',
  SystemMessage: 'SystemMessage',
}));
jest.mock(
  'react-intl',
  () =>
    jest.requireActual<typeof import('../aiFactoryTestUtils')>(
      'pages/inside/aiFactory/aiFactoryTestUtils',
    ).reactIntlTestMock,
);
jest.mock('react-redux', () => ({ useDispatch: jest.fn(), useSelector: jest.fn() }));
jest.mock('redux-first-router-link', () => 'Link');
jest.mock('common/utils', () => ({
  createClassnames:
    () =>
    (...classNames: string[]) =>
      classNames.filter(Boolean).join(' '),
  formatCost: (value: number) => String(value),
}));
jest.mock('controllers/aiFactory/pipelines', () => ({
  getPipelineIterationDetailsAction: jest.fn((pipelineId: number, iterationId: number) => ({
    type: 'GET_PIPELINE_ITERATION_DETAILS',
    payload: { pipelineId, iterationId },
  })),
  getPipelinesAction: jest.fn(() => ({ type: 'GET_PIPELINES' })),
  isReducedPipeline: jest.fn(
    (pipeline: unknown) => typeof pipeline === 'object' && pipeline !== null && 'kind' in pipeline,
  ),
  pipelineCatalogProjectKeySelector: jest.fn(),
  pipelineCatalogRequestIdSelector: jest.fn(),
  pipelineCatalogTransportSelector: jest.fn(),
  pipelineCatalogVersionSelector: jest.fn(),
  pipelineIterationDetailsErrorSelector: jest.fn(),
  pipelineIterationDetailsLoadingSelector: jest.fn(),
  pipelineIterationDetailsSelector: jest.fn(),
  pipelineIterationDetailsUnavailableSelector: jest.fn(),
  pipelinesLoadingSelector: jest.fn(),
  pipelinesSelector: jest.fn(),
}));
jest.mock('controllers/pages', () => ({
  PROJECT_DASHBOARD_PAGE: 'PROJECT_DASHBOARD_PAGE',
  PROJECT_PIPELINE_COMPARISON_PAGE: 'PROJECT_PIPELINE_COMPARISON_PAGE',
  PROJECT_PIPELINES_PAGE: 'PROJECT_PIPELINES_PAGE',
  TEST_CASE_LIBRARY_PAGE: 'TEST_CASE_LIBRARY_PAGE',
  iterationIdSelector: jest.fn(),
  pipelineIdSelector: jest.fn(),
  querySelector: jest.fn(),
  urlOrganizationAndProjectSelector: jest.fn(),
}));
jest.mock('controllers/project', () => ({
  projectKeySelector: jest.fn(),
  projectNameSelector: jest.fn(),
}));
jest.mock('components/preloaders/spinningPreloader', () => ({
  SpinningPreloader: 'SpinningPreloader',
}));
jest.mock('layouts/settingsLayout', () => ({ SettingsLayout: 'SettingsLayout' }));
jest.mock('pages/inside/aiFactory/common', () => ({
  POLLING_REQUEST_STARTED: 'POLLING_REQUEST_STARTED',
  STAGE_LABEL_MESSAGE: {},
  usePolling: jest.fn(),
}));
jest.mock('../../common/pageHeaderWithBreadcrumbsAndActions', () => ({
  PageHeaderWithBreadcrumbsAndActions: 'PageHeaderWithBreadcrumbsAndActions',
}));
jest.mock('../pipelineSettings', () => ({ PipelineSettingsButton: 'PipelineSettingsButton' }));
jest.mock('./kpiTile', () => ({ KpiTile: 'KpiTile' }));
jest.mock('./stageCards', () => ({ StageCards: 'StageCards' }));
jest.mock('./stagePanels', () => ({ StagePanels: 'StagePanels' }));

const dispatch = jest.fn();
const createIteration = (status: IterationStatus): IterationRS =>
  ({
    id: 103,
    pipelineId: 7,
    number: 3,
    status,
    attributes: [],
    stages: [],
  }) as IterationRS;

const richPipeline: PipelineRS = {
  id: 7,
  type: PipelineType.GENERATION,
  name: 'Generation',
  repository: 'repo',
  iterationsCount: 1,
};

interface CatalogOptions {
  projectKey?: string;
  catalogProjectKey?: string | null;
  catalogVersion?: number;
  catalogRequestId?: number | null;
  catalogTransport?: 'mock' | 'live';
  catalogLoading?: boolean;
  iteration?: IterationRS | Record<string, unknown> | null;
  detailError?: boolean;
  detailUnavailable?: boolean;
}

let selectorValues: Map<unknown, unknown>;

const renderPage = (
  status: IterationStatus,
  isLoading = false,
  pipelines: Array<Record<string, unknown>> | PipelineRS[] | null = [richPipeline],
  {
    projectKey = 'demo',
    catalogProjectKey = 'demo',
    catalogVersion = 1,
    catalogRequestId = 1,
    catalogTransport = 'mock',
    catalogLoading = false,
    iteration = createIteration(status),
    detailError = false,
    detailUnavailable = false,
  }: CatalogOptions = {},
  shouldMount = false,
) => {
  selectorValues = new Map<unknown, unknown>([
    [projectNameSelector, 'Demo'],
    [projectKeySelector, projectKey],
    [urlOrganizationAndProjectSelector, { organizationSlug: 'org', projectSlug: 'project' }],
    [pipelineIdSelector, 7],
    [iterationIdSelector, 103],
    [querySelector, {}],
    [pipelinesSelector, pipelines],
    [pipelineCatalogProjectKeySelector, catalogProjectKey],
    [pipelineCatalogRequestIdSelector, catalogRequestId],
    [pipelineCatalogTransportSelector, catalogTransport],
    [pipelineCatalogVersionSelector, catalogVersion],
    [pipelineIterationDetailsSelector, iteration],
    [pipelineIterationDetailsLoadingSelector, isLoading],
    [pipelineIterationDetailsErrorSelector, detailError],
    [pipelineIterationDetailsUnavailableSelector, detailUnavailable],
    [pipelinesLoadingSelector, catalogLoading],
  ]);
  jest.mocked(useDispatch).mockReturnValue(dispatch as unknown as ReturnType<typeof useDispatch>);
  jest
    .mocked(useSelector)
    .mockImplementation(((selector: unknown) =>
      selectorValues.get(selector)) as typeof useSelector);

  return shouldMount
    ? mount(<IterationDetailsPageContent />)
    : shallow(<IterationDetailsPageContent />);
};

describe('IterationDetailsPageContent polling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test.each([IterationStatus.RUNNING, IterationStatus.IN_REVIEW])(
    'polls an active %s iteration every 5 seconds',
    (status) => {
      const wrapper = renderPage(status);
      const poll = jest.mocked(usePolling).mock.calls.at(-1)?.[0];

      expect(usePolling).toHaveBeenLastCalledWith(expect.any(Function), 5000, true);
      expect(poll?.()).toBe(POLLING_REQUEST_STARTED);
      expect(getPipelineIterationDetailsAction).toHaveBeenLastCalledWith(7, 103);
      expect(dispatch).toHaveBeenLastCalledWith({
        type: 'GET_PIPELINE_ITERATION_DETAILS',
        payload: { pipelineId: 7, iterationId: 103 },
      });
      wrapper.unmount();
    },
  );

  test('re-arms polling after loading completes without duplicate dispatches', () => {
    const wrapper = renderPage(IterationStatus.RUNNING);
    const firstPoll = jest.mocked(usePolling).mock.calls.at(-1)?.[0];

    expect(firstPoll?.()).toBe(POLLING_REQUEST_STARTED);
    expect(dispatch).toHaveBeenCalledTimes(1);

    selectorValues.set(pipelineIterationDetailsLoadingSelector, true);
    wrapper.setProps({});
    expect(usePolling).toHaveBeenLastCalledWith(expect.any(Function), 5000, false);
    expect(dispatch).toHaveBeenCalledTimes(1);

    selectorValues.set(pipelineIterationDetailsLoadingSelector, false);
    wrapper.setProps({});
    const rearmedPoll = jest.mocked(usePolling).mock.calls.at(-1)?.[0];
    expect(usePolling).toHaveBeenLastCalledWith(expect.any(Function), 5000, true);
    expect(rearmedPoll?.()).toBe(POLLING_REQUEST_STARTED);
    expect(dispatch).toHaveBeenCalledTimes(2);
    expect(getPipelineIterationDetailsAction).toHaveBeenCalledTimes(2);
    wrapper.unmount();
  });

  test.each([IterationStatus.COMPLETED, IterationStatus.FAILED])(
    'stops polling after the iteration reaches %s',
    (status) => {
      const wrapper = renderPage(status);

      expect(usePolling).toHaveBeenLastCalledWith(expect.any(Function), 5000, false);
      wrapper.unmount();
    },
  );

  test('pauses polling while iteration details are loading to avoid overlapping requests', () => {
    const wrapper = renderPage(IterationStatus.RUNNING, true);

    expect(usePolling).toHaveBeenLastCalledWith(expect.any(Function), 5000, false);
    wrapper.unmount();
  });

  test('requests generic detail for a reduced catalog and renders only the reduced-detail surface', () => {
    const wrapper = renderPage(
      IterationStatus.COMPLETED,
      false,
      [{ kind: 'reduced', id: 7, name: 'Live pipeline' }],
      {
        catalogTransport: 'live',
        iteration: null,
        detailUnavailable: true,
      },
    );

    expect(wrapper.find(ReducedIterationDetails)).toHaveLength(1);
    expect(wrapper.find(ReducedIterationDetails).props()).toMatchObject({
      iteration: null,
      hasError: false,
      isUnavailable: true,
      onRetry: expect.any(Function),
    });
    expect(wrapper.find('KpiTile')).toHaveLength(0);
    expect(wrapper.find('StageCards')).toHaveLength(0);
    expect(wrapper.find('StagePanels')).toHaveLength(0);
    expect(wrapper.find('PipelineSettingsButton')).toHaveLength(0);
    expect(usePolling).toHaveBeenLastCalledWith(expect.any(Function), 5000, false);
    const onRetry = wrapper.find(ReducedIterationDetails).prop('onRetry') as () => void;
    onRetry();
    expect(getPipelineIterationDetailsAction).toHaveBeenCalledWith(7, 103);
    expect(dispatch).toHaveBeenCalledWith({
      type: 'GET_PIPELINE_ITERATION_DETAILS',
      payload: { pipelineId: 7, iterationId: 103 },
    });
    wrapper.unmount();
  });

  test('passes validated reduced LP3 detail through without enabling rich controls or polling', () => {
    const reducedDetail = {
      kind: 'reduced',
      id: 103,
      pipelineId: 7,
      number: 3,
      status: 'PASSED',
      attributes: [],
      stages: [],
    };
    const wrapper = renderPage(
      IterationStatus.COMPLETED,
      false,
      [{ kind: 'reduced', id: 7, name: 'Live pipeline' }],
      { catalogTransport: 'live', iteration: reducedDetail },
    );

    expect(wrapper.find(ReducedIterationDetails).prop('iteration')).toBe(reducedDetail);
    expect(wrapper.find('KpiTile')).toHaveLength(0);
    expect(wrapper.find('StagePanels')).toHaveLength(0);
    expect(wrapper.find('PipelineSettingsButton')).toHaveLength(0);
    expect(usePolling).toHaveBeenLastCalledWith(expect.any(Function), 5000, false);
    wrapper.unmount();
  });

  test('renders an announced loading state while reduced detail is pending', () => {
    const wrapper = renderPage(
      IterationStatus.COMPLETED,
      true,
      [{ kind: 'reduced', id: 7, name: 'Live pipeline' }],
      { catalogTransport: 'live', iteration: null },
    );

    expect(wrapper.find('output').prop('aria-live')).toBe('polite');
    expect(wrapper.find('SpinningPreloader')).toHaveLength(1);
    expect(wrapper.find('output').text()).toContain('Loading iteration details');
    expect(wrapper.find(ReducedIterationDetails)).toHaveLength(0);
    wrapper.unmount();
  });

  test('loads LP1 once per project, hides prior-project data, and requests detail once after provenance is established', () => {
    const staleIteration = createIteration(IterationStatus.COMPLETED);
    const wrapper = renderPage(
      IterationStatus.COMPLETED,
      false,
      [richPipeline],
      {
        catalogProjectKey: 'previous-project',
        catalogVersion: 8,
        iteration: staleIteration,
      },
      true,
    );

    expect(getPipelinesAction).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({ type: 'GET_PIPELINES' });
    expect(getPipelineIterationDetailsAction).not.toHaveBeenCalled();
    expect(wrapper.find('PageHeaderWithBreadcrumbsAndActions')).toHaveLength(0);

    wrapper.setProps({});
    expect(getPipelinesAction).toHaveBeenCalledTimes(1);

    selectorValues.set(pipelineCatalogProjectKeySelector, 'demo');
    selectorValues.set(pipelineCatalogVersionSelector, 9);
    selectorValues.set(pipelineCatalogRequestIdSelector, 9);
    selectorValues.set(pipelineIterationDetailsSelector, null);
    wrapper.setProps({});

    expect(getPipelineIterationDetailsAction).toHaveBeenCalledTimes(1);
    expect(getPipelineIterationDetailsAction).toHaveBeenCalledWith(7, 103);
    expect(dispatch).toHaveBeenCalledWith({
      type: 'GET_PIPELINE_ITERATION_DETAILS',
      payload: { pipelineId: 7, iterationId: 103 },
    });

    wrapper.setProps({});
    expect(getPipelineIterationDetailsAction).toHaveBeenCalledTimes(1);
    wrapper.unmount();
  });
});
