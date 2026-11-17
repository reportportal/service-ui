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
import { mount } from 'enzyme';

import { useAiFactoryEnabled } from 'controllers/aiFactory';

import { loadStageTraceAttempts } from 'controllers/aiFactory/stageTrace';

import { StageTraceAction } from './stageTraceAction';

jest.mock('controllers/aiFactory/stageTrace', () => ({
  loadStageTraceAttempts: jest.fn(),
  StageTraceError: class extends Error {},
}));

const dispatch = jest.fn();
let wrapper: MountedTraceWrapper | undefined;
beforeEach(() => {
  resetStageTraceTestContext(dispatch);
  jest.mocked(loadStageTraceAttempts).mockResolvedValue([
    { attempt: 1, traceStatus: 'REPORTED', eventCount: 3, current: false },
    { attempt: 2, traceStatus: 'NOT_REPORTED', eventCount: 0, current: true },
  ]);
});
afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

const mountAction = async () => {
  await act(async () => {
    wrapper = mount(
      <StageTraceAction projectKey="demo" pipelineId={8} iterationId={34} stageKey="create" />,
    ) as MountedTraceWrapper;
    await Promise.resolve();
  });
  wrapper?.update();
};

test('loads only lightweight attempts and keeps earlier trace reachable when current trace is absent', async () => {
  await mountAction();
  expect(loadStageTraceAttempts).toHaveBeenCalledWith(
    { projectKey: 'demo', iterationId: 34, stageKey: 'create' },
    expect.any(AbortSignal),
  );
  expect(wrapper?.find('output').prop('children')).toContain('earlier attempt');
  act(() => {
    ((wrapper?.find('button') as TraceNodes).at(0).prop('onClick') as () => void)();
  });
  expect(dispatch).toHaveBeenCalledWith({
    type: 'PROJECT_PIPELINE_STAGE_TRACE_PAGE',
    payload: {
      organizationSlug: 'org',
      projectSlug: 'demo',
      pipelineId: 8,
      iterationId: 34,
      stageKey: 'create',
    },
    query: { returnPipelineId: '8', returnIterationId: '34', returnStageKey: 'create' },
  });
});

test('toggle OFF performs no requests and renders no entry', async () => {
  jest.mocked(useAiFactoryEnabled).mockReturnValue(false);
  await mountAction();
  expect(loadStageTraceAttempts).not.toHaveBeenCalled();
  expect(wrapper?.find('button')).toHaveLength(0);
});

test('aborts the old stage request and rejects its late result', async () => {
  let resolve: (value: Awaited<ReturnType<typeof loadStageTraceAttempts>>) => void;
  jest.mocked(loadStageTraceAttempts).mockImplementationOnce(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  await mountAction();
  const signal = jest.mocked(loadStageTraceAttempts).mock.calls[0][1];
  await act(async () => {
    wrapper?.setProps({ stageKey: 'upload' });
    await Promise.resolve();
  });
  wrapper?.update();
  expect(signal?.aborted).toBe(true);
  await act(async () => {
    resolve([{ attempt: 1, traceStatus: 'REPORTED', eventCount: 999, current: true }]);
    await Promise.resolve();
  });
  wrapper?.update();
  expect(wrapper?.find('output').prop('children')).not.toContain('999');
  expect(loadStageTraceAttempts).toHaveBeenLastCalledWith(
    { projectKey: 'demo', iterationId: 34, stageKey: 'upload' },
    expect.any(AbortSignal),
  );
});
