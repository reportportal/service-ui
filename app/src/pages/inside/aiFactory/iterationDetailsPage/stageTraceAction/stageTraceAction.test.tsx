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
import { loadStageTraceAttempts } from 'controllers/aiFactory/stageTrace';

import { StageTraceAction } from './stageTraceAction';

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
jest.mock('controllers/aiFactory/stageTrace', () => ({
  loadStageTraceAttempts: jest.fn(),
  StageTraceError: class extends Error {},
}));

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
    ) as MountedWrapper;
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
    ((wrapper?.find('button') as Nodes).at(0).prop('onClick') as () => void)();
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
