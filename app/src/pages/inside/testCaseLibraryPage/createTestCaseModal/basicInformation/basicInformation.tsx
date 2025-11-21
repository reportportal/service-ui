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
import { formValueSelector, change } from 'redux-form';
import { useDispatch, useSelector } from 'react-redux';
import { Button, FieldText, FieldTextFlex, PlusIcon } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { FieldErrorHint, FieldProvider } from 'components/fields';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { EditableTagsSection } from 'pages/inside/testCaseLibraryPage/editableTagsSection';
import { CreateFolderAutocomplete } from 'pages/inside/testCaseLibraryPage/testCaseFolders/shared/CreateFolderAutocomplete';
import { commonMessages as globalCommonMessages } from 'pages/inside/common/common-messages';
import { TagPopover } from 'pages/inside/testCaseLibraryPage/tagPopover';
import { Attribute } from 'pages/inside/testCaseLibraryPage/types';

import { messages } from './messages';
import { commonMessages } from '../../commonMessages';
import { PrioritySelect } from '../../prioritySelect/prioritySelect';
import { CREATE_TEST_CASE_FORM_NAME } from '../createTestCaseModal';

import styles from './basicInformation.scss';

const cx = createClassnames(styles);

interface BasicInformationProps {
  className?: string;
  hideFolderField?: boolean;
  formName?: string;
}

export const BasicInformation = ({
  className,
  hideFolderField = false,
  formName = CREATE_TEST_CASE_FORM_NAME,
}: BasicInformationProps) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const selector = formValueSelector(formName);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-return
  const attributes: Attribute[] = useSelector((state) => selector(state, 'attributes')) || [];

  const handleTagSelect = (tag: Attribute) => {
    const tagExists = attributes.some((attr) => attr.key === tag.key);
    if (!tagExists) {
      const updatedAttributes = [...attributes, tag];
      dispatch(change(formName, 'attributes', updatedAttributes));
    }
  };

  const handleTagRemove = (tagKey: string) => {
    const updatedAttributes = attributes.filter((attr) => attr.key !== tagKey);
    dispatch(change(formName, 'attributes', updatedAttributes));
  };

  const addButton = (
    <Button variant="text" adjustWidthOn="content" icon={<PlusIcon />}>
      {formatMessage(COMMON_LOCALE_KEYS.ADD)}
    </Button>
  );

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
      {!hideFolderField && (
        <FieldProvider name="folder" placeholder={formatMessage(messages.selectOrCreateFolder)}>
          <FieldErrorHint provideHint={false} className={cx('basic-information__field')}>
            <CreateFolderAutocomplete
              name="folder"
              label={formatMessage(commonMessages.folder)}
              placeholder={formatMessage(messages.selectOrCreateFolder)}
              createWithoutConfirmation={false}
              isRequired
            />
          </FieldErrorHint>
        </FieldProvider>
      )}
      <FieldProvider name="priority">
        <FieldErrorHint provideHint={false} className={cx('basic-information__field')}>
          <PrioritySelect />
        </FieldErrorHint>
      </FieldProvider>
      <FieldProvider name="description" placeholder={formatMessage(messages.addDetailsOrContext)}>
        <FieldErrorHint provideHint={false} className={cx('basic-information__field')}>
          <FieldTextFlex label={formatMessage(globalCommonMessages.description)} value="" />
        </FieldErrorHint>
      </FieldProvider>
      <EditableTagsSection
        variant="modal"
        tags={attributes}
        onTagRemove={handleTagRemove}
        addButton={<TagPopover onTagSelect={handleTagSelect} trigger={addButton} />}
      />
    </div>
  );
};
