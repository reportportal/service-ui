/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { shallow } from 'enzyme';
import { useDispatch, useSelector } from 'react-redux';

import {
  getPipelineIterationDetailsAction,
  pipelineIterationDetailsLoadingSelector,
  pipelineIterationDetailsSelector,
  pipelinesSelector,
} from 'controllers/aiFactory/pipelines';
import {
  iterationIdSelector,
  pipelineIdSelector,
  querySelector,
  urlOrganizationAndProjectSelector,
} from 'controllers/pages';
import { projectNameSelector } from 'controllers/project';
import { POLLING_REQUEST_STARTED, usePolling } from 'pages/inside/aiFactory/common';
import { IterationStatus, type IterationRS } from 'types/aiFactory';

import { IterationDetailsPageContent } from './iterationDetailsPageContent';

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
  pipelineIterationDetailsLoadingSelector: jest.fn(),
  pipelineIterationDetailsSelector: jest.fn(),
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
jest.mock('controllers/project', () => ({ projectNameSelector: jest.fn() }));
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

let selectorValues: Map<unknown, unknown>;

const renderPage = (status: IterationStatus, isLoading = false) => {
  selectorValues = new Map<unknown, unknown>([
    [projectNameSelector, 'Demo'],
    [urlOrganizationAndProjectSelector, { organizationSlug: 'org', projectSlug: 'project' }],
    [pipelineIdSelector, 7],
    [iterationIdSelector, 103],
    [querySelector, {}],
    [pipelinesSelector, null],
    [pipelineIterationDetailsSelector, createIteration(status)],
    [pipelineIterationDetailsLoadingSelector, isLoading],
  ]);
  jest.mocked(useDispatch).mockReturnValue(dispatch as unknown as ReturnType<typeof useDispatch>);
  jest
    .mocked(useSelector)
    .mockImplementation(((selector: unknown) =>
      selectorValues.get(selector)) as typeof useSelector);

  return shallow(<IterationDetailsPageContent />);
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
});
