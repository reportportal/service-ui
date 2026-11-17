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

// Register shared module mocks before importing the components under test.
import {
  resetStageTraceTestContext,
  type MountedTraceWrapper,
  type TraceNodes,
} from 'pages/inside/aiFactory/common/stageTrace/stageTraceTestSetup';

import { act } from 'react';
import { mount, type CommonWrapper } from 'enzyme';

import { useAiFactoryEnabled } from 'controllers/aiFactory';

import { GenerationReviewTraceChooser } from './generationReviewTraceChooser';
import { loadGenerationReviewRounds } from './loadGenerationReviewRounds';

jest.mock('./loadGenerationReviewRounds', () => ({ loadGenerationReviewRounds: jest.fn() }));

const dispatch = jest.fn();
let wrapper: MountedTraceWrapper | undefined;
interface ParagraphNodes {
  map: <T>(callback: (node: CommonWrapper) => T) => T[];
}
const paragraphText = () =>
  // CommonWrapper's legacy type omits the runtime ReactWrapper.map method.
  (wrapper?.find('p') as unknown as ParagraphNodes)
    .map((node) => {
      const text = node.prop('children');
      return typeof text === 'string' ? text : '';
    })
    .join(' ');
beforeEach(() => {
  resetStageTraceTestContext(dispatch);
  jest.mocked(loadGenerationReviewRounds).mockResolvedValue({
    rounds: [
      {
        testCaseId: 42,
        displayId: 'TC1',
        roundId: 123,
        roundNumber: 9,
        iterationId: 72,
        pipelineId: 8,
        stageKey: 'test-case-fix',
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
    ) as MountedTraceWrapper;
    await Promise.resolve();
  });
  wrapper?.update();
};

test('loads native rounds only on demand and carries original Review return context', async () => {
  await mountChooser();
  expect(loadGenerationReviewRounds).not.toHaveBeenCalled();
  expect((wrapper?.find('p') as TraceNodes).at(0).prop('children')).toContain(
    'complete fix round history is not available',
  );
  await act(async () => {
    ((wrapper?.find('button') as TraceNodes).at(0).prop('onClick') as () => void)();
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
    ((wrapper?.find('button') as TraceNodes).at(1).prop('onClick') as () => void)();
  });
  expect(dispatch).toHaveBeenCalledWith({
    type: 'PROJECT_PIPELINE_STAGE_TRACE_PAGE',
    payload: {
      organizationSlug: 'org',
      projectSlug: 'demo',
      pipelineId: 8,
      iterationId: 72,
      stageKey: 'test-case-fix',
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
    ((wrapper?.find('button') as TraceNodes).at(0).prop('onClick') as () => void)();
    await Promise.resolve();
  });
  const signal = jest.mocked(loadGenerationReviewRounds).mock.calls[0][3];
  wrapper?.unmount();
  wrapper = undefined;
  expect(signal.aborted).toBe(true);
  expect(dispatch).not.toHaveBeenCalled();
});

const loadChooser = async () => {
  await act(async () => {
    ((wrapper?.find('button') as TraceNodes).at(0).prop('onClick') as () => void)();
    await Promise.resolve();
  });
  wrapper?.update();
};

test.each(['rejected', 'incomplete'])(
  'shows %s lookup alert without claiming no known rounds',
  async (failure) => {
    if (failure === 'rejected')
      jest.mocked(loadGenerationReviewRounds).mockRejectedValue(new Error('Offline'));
    else
      jest.mocked(loadGenerationReviewRounds).mockResolvedValue({ rounds: [], incomplete: true });
    await mountChooser();
    await loadChooser();
    expect(wrapper?.find('[role="alert"]')).toHaveLength(1);
    expect(paragraphText()).not.toContain('No known fix round');
  },
);

test('retains usable rounds alongside a partial failure alert', async () => {
  jest.mocked(loadGenerationReviewRounds).mockResolvedValue({
    rounds: [
      {
        testCaseId: 42,
        displayId: 'TC1',
        roundId: 123,
        roundNumber: 9,
        iterationId: 72,
        pipelineId: 8,
        stageKey: 'test-case-fix',
      },
    ],
    incomplete: true,
  });
  await mountChooser();
  await loadChooser();
  expect(wrapper?.find('[role="alert"]')).toHaveLength(1);
  expect(wrapper?.find('button')).toHaveLength(2);
  expect(paragraphText()).not.toContain('No known fix round');
});

test('reports an empty result only after a complete successful lookup', async () => {
  jest.mocked(loadGenerationReviewRounds).mockResolvedValue({ rounds: [], incomplete: false });
  await mountChooser();
  await loadChooser();
  expect(wrapper?.find('[role="alert"]')).toHaveLength(0);
  expect(paragraphText()).toContain('No known fix round');
});
