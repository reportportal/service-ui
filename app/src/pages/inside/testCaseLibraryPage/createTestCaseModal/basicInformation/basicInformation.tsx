/*
 * Copyright 2025 EPAM Systems
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

import { defineMessages, useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { FieldErrorHint, FieldProvider } from 'components/fields';
import { FieldText, FieldTextFlex } from '@reportportal/ui-kit';

import { TagList } from 'pages/inside/productVersionPage/linkedTestCasesTab/tagList';
import { DropdownWithDescription } from '../dropdownWithDescription';
import { noop } from '../../constans';

import styles from './basicInformation.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  testCaseName: {
    id: 'CreateTestCaseModal.testCaseName',
    defaultMessage: 'Test case name',
  },
  enterNameForTestCase: {
    id: 'CreateTestCaseModal.enterNameForTestCase',
    defaultMessage: 'Enter name for the test case',
  },
  folder: {
    id: 'CreateTestCaseModal.folder',
    defaultMessage: 'Folder',
  },
  selectOrCreateFolder: {
    id: 'CreateTestCaseModal.selectOrCreateFolder',
    defaultMessage: 'Select or create the folder',
  },
  addDetailsOrContext: {
    id: 'CreateTestCaseModal.addDetailsOrContext',
    defaultMessage: 'Add details or context for the test case here',
  },
  description: {
    id: 'CreateTestCaseModal.description',
    defaultMessage: 'Description',
  },
  priority: {
    id: 'CreateTestCaseModal.priority',
    defaultMessage: 'Priority',
  },
  priorityLow: {
    id: 'CreateTestCaseModal.priorityLow',
    defaultMessage: 'Low',
  },
  priorityLowDescription: {
    id: 'CreateTestCaseModal.priorityLowDescription',
    defaultMessage: 'For non-critical tests like UI tweaks',
  },
  priorityNormal: {
    id: 'CreateTestCaseModal.priorityNormal',
    defaultMessage: 'Normal',
  },
  priorityNormalDescription: {
    id: 'CreateTestCaseModal.priorityNormalDescription',
    defaultMessage: 'For standard tests covering core functions',
  },
  priorityHigh: {
    id: 'CreateTestCaseModal.priorityHigh',
    defaultMessage: 'High',
  },
  priorityHighDescription: {
    id: 'CreateTestCaseModal.priorityHighDescription',
    defaultMessage: 'For crucial tests involving major features or security',
  },
});

export const BasicInformation = () => {
  const { formatMessage } = useIntl();

  return (
    <div className={cx('basic-information')}>
      <FieldProvider name="testCaseName" placeholder={formatMessage(messages.enterNameForTestCase)}>
        <FieldErrorHint provideHint={false} className={cx('basic-information__field')}>
          <FieldText label={formatMessage(messages.testCaseName)} defaultWidth={false} isRequired />
        </FieldErrorHint>
      </FieldProvider>
      <FieldProvider name="folder" placeholder={formatMessage(messages.selectOrCreateFolder)}>
        <FieldErrorHint provideHint={false} className={cx('basic-information__field')}>
          <FieldText label={formatMessage(messages.folder)} defaultWidth={false} isRequired />
        </FieldErrorHint>
      </FieldProvider>
      <FieldProvider name="priority" placeholder={formatMessage(messages.selectOrCreateFolder)}>
        <FieldErrorHint provideHint={false} className={cx('basic-information__field')}>
          <DropdownWithDescription
            label={formatMessage(messages.priority)}
            value="normal"
            options={[
              {
                label: formatMessage(messages.priorityLow),
                description: formatMessage(messages.priorityLowDescription),
                value: 'low',
              },
              {
                label: formatMessage(messages.priorityNormal),
                description: formatMessage(messages.priorityNormalDescription),
                value: 'normal',
              },
              {
                label: formatMessage(messages.priorityHigh),
                description: formatMessage(messages.priorityHighDescription),
                value: 'high',
              },
            ]}
            onChange={noop}
          />
        </FieldErrorHint>
      </FieldProvider>
      <FieldProvider name="description" placeholder={formatMessage(messages.addDetailsOrContext)}>
        <FieldErrorHint provideHint={false} className={cx('basic-information__field')}>
          <FieldTextFlex label={formatMessage(messages.description)} value="" />
        </FieldErrorHint>
      </FieldProvider>
      <TagList tags={['iOS System', 'iOS System Functionality Test']} />
    </div>
  );
};
