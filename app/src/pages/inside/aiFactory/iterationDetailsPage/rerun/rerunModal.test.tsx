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

import { shallow } from 'enzyme';
import { useDispatch } from 'react-redux';
import { Modal } from '@reportportal/ui-kit';

import { IterationStatus, PipelineType, type IterationRS, type PipelineRS } from 'types/aiFactory';

import { IterationRerunModalContent } from './rerunModal';

jest.mock('@reportportal/ui-kit', () => ({
  Dropdown: 'Dropdown',
  Modal: 'Modal',
  SystemMessage: 'SystemMessage',
}));
jest.mock(
  'react-intl',
  () =>
    jest.requireActual<typeof import('../../aiFactoryTestUtils')>(
      'pages/inside/aiFactory/aiFactoryTestUtils',
    ).reactIntlTestMock,
);
jest.mock('react-redux', () => ({ useDispatch: jest.fn() }));
jest.mock('common/utils', () => ({
  createClassnames: () => (...classNames: string[]) => classNames.filter(Boolean).join(' '),
}));
jest.mock('controllers/modal', () => ({
  hideModalAction: () => ({ type: 'HIDE_MODAL' }),
  withModal: () => (component: unknown) => component,
}));

const dispatch = jest.fn();
const pipeline: PipelineRS = {
  id: 1,
  type: PipelineType.GENERATION,
  name: 'Test case generation',
  repository: 'EPM-RPP/rp-tests',
  iterationsCount: 4,
  rerunOptions: {
    models: ['auto (default)', 'model-A', 'model-B'],
    environments: ['beta5', 'qa', 'dev5'],
  },
};
const iteration = {
  id: 104,
  pipelineId: 1,
  number: 4,
  status: IterationStatus.FAILED,
  requirement: { specId: 'US-TMS-EXP-002', title: 'Editor can export Test Cases to CSV' },
  model: 'auto (default)',
  environment: 'beta5',
  stages: [],
} as IterationRS;

describe('IterationRerunModalContent', () => {
  beforeEach(() => {
    jest.mocked(useDispatch).mockReturnValue(dispatch as unknown as ReturnType<typeof useDispatch>);
  });

  test('shows the source iteration and mock model/environment options without enabling LP6', () => {
    const wrapper = shallow(<IterationRerunModalContent data={{ pipeline, iteration }} />);
    const modal = wrapper.find(Modal);
    const modelDropdown = wrapper.find('[data-automation-id="rerunModel"]');
    const environmentDropdown = wrapper.find('[data-automation-id="rerunEnvironment"]');

    expect(modal.prop('title')).toBe('Re-run iteration');
    expect(modal.prop('okButton')).toMatchObject({ children: 'Re-run', disabled: true });
    expect(wrapper.text()).toContain('US-TMS-EXP-002');
    expect(wrapper.text()).toContain('Iteration #4');
    expect(modelDropdown.prop('value')).toBe('auto (default)');
    expect(modelDropdown.prop('options')).toHaveLength(3);
    expect(environmentDropdown.prop('value')).toBe('beta5');
    expect(environmentDropdown.prop('options')).toHaveLength(3);
  });
});
