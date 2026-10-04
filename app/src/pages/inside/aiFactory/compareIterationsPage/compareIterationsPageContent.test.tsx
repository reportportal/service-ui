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

import { mount, ReactWrapper } from 'enzyme';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Dropdown, SystemMessage } from '@reportportal/ui-kit';

import {
  clearPipelineComparisonAction,
  getPipelineComparisonAction,
  getPipelineIterationsAction,
  pipelineCatalogTransportSelector,
  pipelineComparisonErrorSelector,
  pipelineComparisonLoadingSelector,
  pipelineComparisonSelector,
  pipelineIterationsByPipelineSelector,
  pipelineIterationsLoadingSelector,
  pipelinesLoadingSelector,
  pipelinesSelector,
} from 'controllers/aiFactory/pipelines';
import {
  querySelector,
  updatePagePropertiesAction,
  urlOrganizationAndProjectSelector,
} from 'controllers/pages';
import { projectNameSelector } from 'controllers/project';
import {
  IterationStatus,
  PipelineComparison,
  PipelineRS,
  PipelineType,
  type IterationSummaryRS,
} from 'types/aiFactory';

import { CompareIterationsPageContent } from './compareIterationsPageContent';
import { ComparisonResult } from './comparisonResult';

jest.mock('@reportportal/ui-kit', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  return {
    Button: ({ children, onClick }: { children?: React.ReactNode; onClick?: () => void }) =>
      React.createElement('button', { onClick }, children),
    Dropdown: ({ 'data-automation-id': automationId }: { 'data-automation-id'?: string }) =>
      React.createElement('div', { 'data-automation-id': automationId }),
    SystemMessage: ({ children }: { children?: React.ReactNode }) =>
      React.createElement('div', null, children),
  };
});
jest.mock('react-intl', () => ({
  defineMessages: (messages: unknown) => messages,
  useIntl: () => ({
    formatMessage: (
      message: { defaultMessage?: string; id?: string },
      values: Record<string, string | number> = {},
    ) =>
      Object.entries(values).reduce(
        (text, [key, value]) => text.replace(`{${key}}`, String(value)),
        message.defaultMessage ?? message.id ?? '',
      ),
  }),
}));
jest.mock('react-redux', () => ({ useDispatch: jest.fn(), useSelector: jest.fn() }));
jest.mock('common/utils', () => ({
  createClassnames:
    () =>
    (...classNames: string[]) =>
      classNames.filter(Boolean).join(' '),
}));
jest.mock('components/main/scrollWrapper', () => ({
  ScrollWrapper: ({ children }: { children?: React.ReactNode }) => children,
}));
jest.mock('components/preloaders/spinningPreloader', () => ({
  SpinningPreloader: () => <div data-testid="spinning-preloader" />,
}));
jest.mock('controllers/aiFactory/pipelines', () => ({
  clearPipelineComparisonAction: jest.fn(() => ({ type: 'CLEAR_COMPARISON' })),
  getPipelineComparisonAction: jest.fn((pipelineId, candidateIterationId, baselineIterationId) => ({
    type: 'GET_COMPARISON',
    payload: { pipelineId, candidateIterationId, baselineIterationId },
  })),
  getPipelineIterationsAction: jest.fn((pipelineIds) => ({
    type: 'GET_ITERATIONS',
    payload: { pipelineIds },
  })),
  isRichPipeline: jest.fn(
    (pipeline: unknown) =>
      typeof pipeline !== 'object' || pipeline === null || !('kind' in pipeline),
  ),
  isRichPipelineIteration: jest.fn(
    (iteration: unknown) =>
      typeof iteration !== 'object' || iteration === null || !('kind' in iteration),
  ),
  pipelineCatalogTransportSelector: jest.fn(),
  pipelineComparisonErrorSelector: jest.fn(),
  pipelineComparisonLoadingSelector: jest.fn(),
  pipelineComparisonSelector: jest.fn(),
  pipelineIterationsByPipelineSelector: jest.fn(),
  pipelineIterationsLoadingSelector: jest.fn(),
  pipelinesLoadingSelector: jest.fn(),
  pipelinesSelector: jest.fn(),
}));
jest.mock('controllers/pages', () => ({
  PROJECT_DASHBOARD_PAGE: 'PROJECT_DASHBOARD_PAGE',
  PROJECT_PIPELINES_PAGE: 'PROJECT_PIPELINES_PAGE',
  querySelector: jest.fn(),
  updatePagePropertiesAction: jest.fn((payload) => ({ type: 'UPDATE_PAGE', payload })),
  urlOrganizationAndProjectSelector: jest.fn(),
}));
jest.mock('controllers/project', () => ({ projectNameSelector: jest.fn() }));
jest.mock('layouts/settingsLayout', () => ({
  SettingsLayout: ({ children }: { children?: React.ReactNode }) => children,
}));
jest.mock('pages/inside/common/pageHeaderWithBreadcrumbsAndActions', () => ({
  PageHeaderWithBreadcrumbsAndActions: () => <div data-testid="page-header" />,
}));
jest.mock('./comparisonResult', () => ({
  ComparisonResult: () => <div data-testid="comparison-result" />,
}));

const dispatch = jest.fn();
const generationPipeline: PipelineRS = {
  id: 1,
  type: PipelineType.GENERATION,
  name: 'Generation',
  repository: 'repo',
  iterationsCount: 3,
};
const automationPipeline: PipelineRS = {
  id: 2,
  type: PipelineType.AUTOMATION,
  name: 'Automation',
  repository: 'repo',
  iterationsCount: 1,
};
const iteration = (id: number, number: number, pipelineId = 1): IterationSummaryRS => ({
  id,
  pipelineId,
  number,
  status: IterationStatus.COMPLETED,
  trigger: 'CI',
  startedBy: 'user',
  model: 'model',
  environment: 'demo',
  startedAt: 1,
  testCasesCount: 1,
  costTotal: 0,
  ciPipeline: { id: String(id), url: 'https://ci.example' },
  attributes: [],
  stages: [],
});
const iterations = [iteration(101, 1), iteration(103, 3), iteration(102, 2)];
const loadedComparison: PipelineComparison = {
  mode: 'status-only',
  pipelineId: 1,
  baseline: { id: 102, number: 2, status: IterationStatus.COMPLETED },
  candidate: { id: 103, number: 3, status: IterationStatus.COMPLETED },
  hasDifferentRequirements: false,
  stages: [],
};

type SelectorValues = {
  query?: Record<string, unknown>;
  pipelines?: PipelineRS[] | null;
  pipelinesLoading?: boolean;
  iterationsByPipeline?: Record<number, IterationSummaryRS[]> | null;
  iterationsLoading?: boolean;
  comparison?: PipelineComparison | null;
  comparisonLoading?: boolean;
  comparisonError?: boolean;
  transport?: 'mock' | 'live';
};

interface DropdownProps {
  onChange?: (value: number) => void;
}

interface TestNode {
  props: () => DropdownProps;
}

interface TestNodeCollection {
  at: (index: number) => TestNode;
}

const renderPage = (values: SelectorValues = {}): ReactWrapper => {
  const selectorValues = new Map<unknown, unknown>([
    [projectNameSelector, 'Demo'],
    [urlOrganizationAndProjectSelector, { organizationSlug: 'org', projectSlug: 'project' }],
    [querySelector, values.query ?? { pipeline: '1', baseline: '102', candidate: '103' }],
    [pipelinesSelector, values.pipelines === undefined ? [generationPipeline] : values.pipelines],
    [pipelineCatalogTransportSelector, values.transport ?? 'mock'],
    [pipelinesLoadingSelector, values.pipelinesLoading ?? false],
    [
      pipelineIterationsByPipelineSelector,
      values.iterationsByPipeline === undefined ? { 1: iterations } : values.iterationsByPipeline,
    ],
    [pipelineIterationsLoadingSelector, values.iterationsLoading ?? false],
    [pipelineComparisonSelector, values.comparison ?? null],
    [pipelineComparisonLoadingSelector, values.comparisonLoading ?? false],
    [pipelineComparisonErrorSelector, values.comparisonError ?? false],
  ]);
  jest.mocked(useDispatch).mockReturnValue(dispatch as unknown as ReturnType<typeof useDispatch>);
  jest
    .mocked(useSelector)
    .mockImplementation(((selector: unknown) =>
      selectorValues.get(selector)) as typeof useSelector);

  return mount(<CompareIterationsPageContent />);
};

describe('CompareIterationsPageContent', () => {
  let wrapper: ReactWrapper | undefined;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    wrapper?.unmount();
    wrapper = undefined;
  });

  test('defaults to a pipeline with two iterations and then defaults to its latest pair', () => {
    wrapper = renderPage({
      query: {},
      pipelines: [automationPipeline, generationPipeline],
      iterationsByPipeline: null,
    });
    expect(updatePagePropertiesAction).toHaveBeenCalledWith({ pipeline: 1 });

    wrapper.unmount();
    jest.clearAllMocks();
    wrapper = renderPage({ query: { pipeline: '1' } });
    expect(updatePagePropertiesAction).toHaveBeenCalledWith({ baseline: 102, candidate: 103 });
  });

  test('loads iterations for a canonical selected pipeline and resets both iteration selections on pipeline change', () => {
    wrapper = renderPage({
      query: { pipeline: '1' },
      iterationsByPipeline: {},
    });

    expect(getPipelineIterationsAction).toHaveBeenCalledWith([1]);
    const dropdowns = wrapper.find(Dropdown) as unknown as TestNodeCollection;
    const pipelineDropdown = dropdowns.at(0);
    pipelineDropdown.props().onChange?.(2);
    expect(updatePagePropertiesAction).toHaveBeenCalledWith({
      pipeline: 2,
      baseline: null,
      candidate: null,
    });
  });

  test.each([
    [{ pipeline: '1', baseline: '101', candidate: '101' }, 'same pair'],
    [{ pipeline: '1', baseline: '101' }, 'missing candidate'],
    [{ pipeline: '1', baseline: '101', candidate: '201' }, 'cross-pipeline candidate'],
  ])('clears and guards the %s selection immediately (%s)', (query, _description) => {
    wrapper = renderPage({ query });

    expect(clearPipelineComparisonAction).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({ type: 'CLEAR_COMPARISON' });
    expect(getPipelineComparisonAction).not.toHaveBeenCalled();
    expect(wrapper.find('.state').prop('children')).toBe(
      'Select two different iterations from the same pipeline.',
    );
  });

  test('keeps a valid mounted comparison and clears it on unmount', () => {
    wrapper = renderPage({ comparison: loadedComparison });

    expect(clearPipelineComparisonAction).not.toHaveBeenCalled();
    wrapper.unmount();
    wrapper = undefined;
    expect(clearPipelineComparisonAction).toHaveBeenCalledTimes(1);
  });

  test('shows the less-than-two guard and never requests a comparison', () => {
    wrapper = renderPage({
      query: { pipeline: '1' },
      iterationsByPipeline: { 1: [iteration(101, 1)] },
    });

    expect(wrapper.find('.state').prop('children')).toBe(
      'At least two iterations of the same pipeline are required for comparison.',
    );
    expect(getPipelineComparisonAction).not.toHaveBeenCalled();
  });

  test('renders loading until the selected comparison arrives, not stale comparison data', () => {
    wrapper = renderPage({
      comparison: {
        ...loadedComparison,
        candidate: { id: 101, number: 1, status: IterationStatus.COMPLETED },
      },
    });

    expect(wrapper.find('[data-testid="spinning-preloader"]')).toHaveLength(1);
    expect(wrapper.find(ComparisonResult)).toHaveLength(0);
    expect(getPipelineComparisonAction).toHaveBeenCalledWith(1, 103, 102);
  });

  test('renders the matching comparison after loading succeeds', () => {
    wrapper = renderPage({ comparison: loadedComparison });

    expect(wrapper.find(ComparisonResult).prop('comparison')).toBe(loadedComparison);
  });

  test('renders loading while pipelines or selected iterations are being fetched', () => {
    wrapper = renderPage({ pipelines: null, pipelinesLoading: true });
    const pipelineLoadingState = wrapper.find('.state--loading');
    const loadingAnnouncement = pipelineLoadingState.find('output');
    expect(loadingAnnouncement.props()).toMatchObject({
      'aria-live': 'polite',
      'aria-atomic': 'true',
    });
    expect(loadingAnnouncement.prop('role')).toBeUndefined();

    wrapper.unmount();
    wrapper = renderPage({
      query: { pipeline: '1' },
      iterationsByPipeline: {},
      iterationsLoading: true,
    });
    expect(wrapper.find('[data-testid="spinning-preloader"]')).toHaveLength(1);
  });

  test('renders comparison error and retries the exact selected pair', () => {
    wrapper = renderPage({ comparisonError: true });

    expect(wrapper.find(SystemMessage).prop('mode')).toBe('error');
    expect(wrapper.find('[aria-live="assertive"]').props()).toMatchObject({
      'aria-live': 'assertive',
      'aria-atomic': 'true',
    });
    expect(wrapper.find('[aria-live="assertive"]').prop('role')).toBeUndefined();
    expect(wrapper.find('[aria-live="assertive"]').prop('children')).toBe(
      'The comparison could not be loaded.',
    );
    (wrapper.find(Button).prop('onClick') as () => void)();
    expect(getPipelineComparisonAction).toHaveBeenLastCalledWith(1, 103, 102);
  });

  test('blocks mock comparison requests when the catalog provenance is live', () => {
    wrapper = renderPage({ transport: 'live' });

    expect(wrapper.find('.state').prop('children')).toBe(
      'Comparison is unavailable for this pipeline source',
    );
    expect(getPipelineComparisonAction).not.toHaveBeenCalled();
    expect(getPipelineIterationsAction).not.toHaveBeenCalled();
    expect(clearPipelineComparisonAction).toHaveBeenCalledTimes(1);
  });
});
