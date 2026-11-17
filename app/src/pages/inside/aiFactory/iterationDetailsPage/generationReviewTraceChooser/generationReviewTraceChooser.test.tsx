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
import { mount, type ReactWrapper, type CommonWrapper } from 'enzyme';
import { useDispatch, useSelector } from 'react-redux';

import { useAiFactoryEnabled } from 'controllers/aiFactory';

import { GenerationReviewTraceChooser } from './generationReviewTraceChooser';
import { loadGenerationReviewRounds } from './loadGenerationReviewRounds';

jest.mock('react-redux', () => ({ useDispatch: jest.fn(), useSelector: jest.fn() }));
jest.mock('@reportportal/ui-kit', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  return {
    Button: ({
      children,
      onClick,
      disabled,
    }: {
      children?: React.ReactNode;
      onClick?: () => void;
      disabled?: boolean;
    }) => React.createElement('button', { onClick, disabled }, children),
  };
});
jest.mock(
  'react-intl',
  () =>
    jest.requireActual<typeof import('../../aiFactoryTestUtils')>(
      'pages/inside/aiFactory/aiFactoryTestUtils',
    ).reactIntlTestMock,
);
jest.mock('controllers/aiFactory', () => ({ useAiFactoryEnabled: jest.fn() }));
jest.mock('controllers/pages', () => ({
  PROJECT_PIPELINE_STAGE_TRACE_PAGE: 'PROJECT_PIPELINE_STAGE_TRACE_PAGE',
  urlOrganizationAndProjectSelector: jest.fn(),
}));
jest.mock('./loadGenerationReviewRounds', () => ({ loadGenerationReviewRounds: jest.fn() }));

const dispatch = jest.fn();
interface MountedWrapper extends ReactWrapper {
  update: () => MountedWrapper;
}
interface Nodes extends CommonWrapper {
  at: (index: number) => CommonWrapper;
}
let wrapper: MountedWrapper | undefined;
beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useDispatch).mockReturnValue(dispatch);
  jest.mocked(useSelector).mockReturnValue({ organizationSlug: 'org', projectSlug: 'demo' });
  jest.mocked(useAiFactoryEnabled).mockReturnValue(true);
  jest.mocked(loadGenerationReviewRounds).mockResolvedValue({
    rounds: [
      {
        testCaseId: 42,
        displayId: 'TC1',
        roundId: 123,
        roundNumber: 9,
        iterationId: 72,
        pipelineId: 8,
      },
    ],
    incomplete: false,
  });
});
afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

const mountChooser = async () => {
  await act(async () => {
    wrapper = mount(
      <GenerationReviewTraceChooser
        projectKey="demo"
        displayIds={['TC1']}
        pipelineId={8}
        iterationId={34}
        stageKey="review"
      />,
    ) as MountedWrapper;
    await Promise.resolve();
  });
  wrapper?.update();
};

test('loads native rounds only on demand and carries original Review return context', async () => {
  await mountChooser();
  expect(loadGenerationReviewRounds).not.toHaveBeenCalled();
  expect((wrapper?.find('p') as Nodes).at(0).prop('children')).toContain(
    'complete fix round history is not available',
  );
  await act(async () => {
    ((wrapper?.find('button') as Nodes).at(0).prop('onClick') as () => void)();
    await Promise.resolve();
  });
  wrapper?.update();
  expect(loadGenerationReviewRounds).toHaveBeenCalledWith(
    'demo',
    ['TC1'],
    { sourcePipelineId: 8, sourceIterationId: 34 },
    expect.any(AbortSignal),
  );
  act(() => {
    ((wrapper?.find('button') as Nodes).at(1).prop('onClick') as () => void)();
  });
  expect(dispatch).toHaveBeenCalledWith({
    type: 'PROJECT_PIPELINE_STAGE_TRACE_PAGE',
    payload: {
      organizationSlug: 'org',
      projectSlug: 'demo',
      pipelineId: 8,
      iterationId: 72,
      stageKey: 'fix',
    },
    query: {
      fixRoundNumber: '9',
      returnPipelineId: '8',
      returnIterationId: '34',
      returnStageKey: 'review',
    },
  });
});

test('toggle OFF exposes no chooser and does not resolve native rounds', async () => {
  jest.mocked(useAiFactoryEnabled).mockReturnValue(false);
  await mountChooser();
  expect(loadGenerationReviewRounds).not.toHaveBeenCalled();
  expect(wrapper?.find('button')).toHaveLength(0);
});

test('unmount aborts an in-flight lookup', async () => {
  jest.mocked(loadGenerationReviewRounds).mockImplementation(() => new Promise(() => {}));
  await mountChooser();
  await act(async () => {
    ((wrapper?.find('button') as Nodes).at(0).prop('onClick') as () => void)();
    await Promise.resolve();
  });
  const signal = jest.mocked(loadGenerationReviewRounds).mock.calls[0][3];
  wrapper?.unmount();
  wrapper = undefined;
  expect(signal.aborted).toBe(true);
  expect(dispatch).not.toHaveBeenCalled();
});
