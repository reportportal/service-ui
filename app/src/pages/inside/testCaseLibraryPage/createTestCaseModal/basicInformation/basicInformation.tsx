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

import { useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { FieldText, FieldTextFlex, PriorityUnspecifiedIcon } from '@reportportal/ui-kit';

import { FieldErrorHint, FieldProvider } from 'components/fields';
import { EditableTagsSection } from 'pages/inside/testCaseLibraryPage/editableTagsSection';
import { DropdownWithDescription } from 'pages/inside/testCaseLibraryPage/createTestCaseModal/dropdownWithDescription';

import { PriorityIcon } from 'pages/inside/common/priorityIcon';
import { noop } from '../../constants';
import { messages } from './messages';

import styles from './basicInformation.scss';

const cx = classNames.bind(styles);

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
            selectedItem={{
              label: formatMessage(messages.priorityUnspecified),
              icon: <PriorityUnspecifiedIcon />,
              value: 'unspecified',
            }}
            options={[
              {
                label: formatMessage(messages.priorityBlocker),
                value: 'blocker',
                icon: <PriorityIcon priority="blocker" />,
              },
              {
                label: formatMessage(messages.priorityCritical),
                value: 'critical',
                icon: <PriorityIcon priority="critical" />,
              },
              {
                label: formatMessage(messages.priorityHigh),
                value: 'high',
                icon: <PriorityIcon priority="high" />,
              },
              {
                label: formatMessage(messages.priorityMedium),
                value: 'medium',
                icon: <PriorityIcon priority="medium" />,
              },
              {
                label: formatMessage(messages.priorityLow),
                value: 'low',
                icon: <PriorityIcon priority="low" />,
              },
              {
                label: formatMessage(messages.priorityUnspecified),
                value: 'unspecified',
                icon: <PriorityIcon priority="unspecified" />,
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
      <EditableTagsSection onAddTag={noop} variant="modal" />
    </div>
  );
};
