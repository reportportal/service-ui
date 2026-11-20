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
} from 'pages/inside/aiFactory/common/stageTrace/stageTraceTestSetup';

import { mount } from 'enzyme';

import { useAiFactoryEnabled } from 'controllers/aiFactory';

import { loadStageTraceAttempts } from 'controllers/aiFactory/stageTrace';

import { StageTraceAction } from './stageTraceAction';

jest.mock('controllers/aiFactory/stageTrace', () => ({
  loadStageTraceAttempts: jest.fn(),
}));

const dispatch = jest.fn();
let wrapper: MountedTraceWrapper | undefined;
beforeEach(() => {
  resetStageTraceTestContext(dispatch);
});
afterEach(() => {
  wrapper?.unmount();
  wrapper = undefined;
});

const mountAction = () => {
  wrapper = mount(
    <StageTraceAction pipelineId={8} iterationId={34} stageKey="create" />,
  ) as MountedTraceWrapper;
  return wrapper;
};

test('renders only Open trace and navigates without fetching availability', () => {
  const action = mountAction();
  expect(action.find('button')).toHaveLength(1);
  expect(action.find('output')).toHaveLength(0);
  (action.find('button[children="Open trace"]').prop('onClick') as () => void)();
  expect(loadStageTraceAttempts).not.toHaveBeenCalled();
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

test('toggle OFF renders no entry', () => {
  jest.mocked(useAiFactoryEnabled).mockReturnValue(false);
  expect(mountAction().find('button')).toHaveLength(0);
});
