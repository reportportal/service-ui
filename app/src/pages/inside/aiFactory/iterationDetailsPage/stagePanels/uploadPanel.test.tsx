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

import { StageKey, StageStatus, type StageRS, UploadResult } from 'types/aiFactory';

import { UploadPanel } from './uploadPanel';

jest.mock('@reportportal/ui-kit', () => ({
  Button: 'Button',
  RerunIcon: 'RerunIcon',
  SystemMessage: 'SystemMessage',
}));
jest.mock('pages/inside/aiFactory/common', () => ({
  StageStatusLabel: 'StageStatusLabel',
}));
jest.mock('react-intl', () => ({
  defineMessages: (messages: unknown) => messages,
  useIntl: () => ({ formatMessage: (message: { defaultMessage: string }) => message.defaultMessage }),
}));

const uploadStage = (status: StageStatus) =>
  ({
    key: StageKey.UPLOAD,
    status,
    cost: 0,
    tokens: [],
    ciJob: { id: '#8930412', url: '#' },
    failureReason: 'Library unreachable',
    upload: {
      threshold: 90,
      results: [
        {
          name: 'Export Test Cases',
          result: UploadResult.CREATED_DRAFT,
          score: 85,
        },
      ],
    },
  }) as StageRS;

describe('UploadPanel', () => {
  test('shows rollback warning, attempt history, and disabled Retry Upload for a failed stage', () => {
    const wrapper = shallow(
      <UploadPanel stage={uploadStage(StageStatus.FAILED)} iterationNumber={4} />,
    );

    expect(wrapper.find('[data-automation-id="failedUploadPanel"]')).toHaveLength(1);
    expect(wrapper.find('SystemMessage').prop('mode')).toBe('warning');
    expect(wrapper.find('.attempt-table tbody tr')).toHaveLength(1);
    expect(wrapper.find('[data-automation-id="retryUploadButton"]').prop('disabled')).toBe(true);
  });

  test('shows upload results for a passed stage', () => {
    expect(
      shallow(<UploadPanel stage={uploadStage(StageStatus.PASSED)} iterationNumber={4} />).find(
        '[data-automation-id="uploadPanel"]',
      ),
    ).toHaveLength(1);
  });
});
