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
import { noop } from 'es-toolkit';
import classNames from 'classnames/bind';
import { FieldText, FieldTextFlex } from '@reportportal/ui-kit';

import { FieldErrorHint, FieldProvider } from 'components/fields';
import { EditableTagsSection } from 'pages/inside/testCaseLibraryPage/editableTagsSection';
import { CreateFolderAutocomplete } from 'pages/inside/testCaseLibraryPage/testCaseFolders/shared/CreateFolderAutocomplete';

import { messages } from './messages';
import { commonMessages } from '../../commonMessages';
import { PrioritySelect } from '../../prioritySelect/prioritySelect';

import styles from './basicInformation.scss';

const cx = classNames.bind(styles) as typeof classNames;

interface BasicInformationProps {
  className?: string;
}

export const BasicInformation = ({ className }: BasicInformationProps) => {
  const { formatMessage } = useIntl();

  return (
    <div className={cx('basic-information', className)}>
      <FieldProvider name="name" placeholder={formatMessage(messages.enterNameForTestCase)}>
        <FieldErrorHint provideHint={false} className={cx('basic-information__field')}>
          <FieldText
            label={formatMessage(commonMessages.testCaseName)}
            defaultWidth={false}
            isRequired
          />
        </FieldErrorHint>
      </FieldProvider>
      <FieldProvider name="folder" placeholder={formatMessage(messages.selectOrCreateFolder)}>
        <FieldErrorHint provideHint={false} className={cx('basic-information__field')}>
          <CreateFolderAutocomplete
            name="folder"
            label={formatMessage(messages.folder)}
            placeholder={formatMessage(messages.selectOrCreateFolder)}
            isRequired
          />
        </FieldErrorHint>
      </FieldProvider>
      <FieldProvider name="priority">
        <FieldErrorHint provideHint={false} className={cx('basic-information__field')}>
          <PrioritySelect />
        </FieldErrorHint>
      </FieldProvider>
      <FieldProvider name="description" placeholder={formatMessage(messages.addDetailsOrContext)}>
        <FieldErrorHint provideHint={false} className={cx('basic-information__field')}>
          <FieldTextFlex label={formatMessage(messages.description)} value="" />
        </FieldErrorHint>
      </FieldProvider>
      <EditableTagsSection variant="modal" onAddTag={noop} />
    </div>
  );
};
