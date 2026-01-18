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

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { reduxForm, InjectedFormProps } from 'redux-form';
import { noop } from 'es-toolkit';

import { UseModalData } from 'common/hooks';
import { createClassnames } from 'common/utils';
import { withModal } from 'controllers/modal';
import { TransformedFolder, transformedFoldersWithFullPathSelector } from 'controllers/testCase';
import { commonValidators } from 'common/utils/validation';
import { coerceToNumericId } from 'pages/inside/testCaseLibraryPage/utils';
import { commonMessages } from 'pages/inside/testCaseLibraryPage/commonMessages';

import { commonFolderMessages } from '../commonFolderMessages';
import { DUPLICATE_FORM_NAME } from '../constants';
import { messages } from './messages';
import { DuplicateFolderFormValues } from '../types';
import { FolderModal } from '../folderModal';
import { useBooleanFormFieldValue } from '../../../hooks/useFormFieldValue';
import { useDuplicateFolder } from './useDuplicateFolder';

import styles from '../folderModal/folderModal.scss';

const cx = createClassnames(styles);

export const DUPLICATE_FOLDER_MODAL_KEY = 'duplicateFolderModalKey';

export interface DuplicateFolderModalData {
  folder: TransformedFolder;
}

type DuplicateFolderModalProps = UseModalData<DuplicateFolderModalData>;

const DuplicateFolderModal = reduxForm<DuplicateFolderFormValues, DuplicateFolderModalProps>({
  form: DUPLICATE_FORM_NAME,
  destroyOnUnmount: true,
  shouldValidate: () => true,
  validate: ({ folderName, destinationFolder, moveToRoot }) => ({
    folderName: commonValidators.requiredField(folderName),
    destinationFolder: !moveToRoot ? commonValidators.requiredField(destinationFolder) : undefined,
  }),
})(({
  dirty,
  data: {
    folder: { id: folderId, name: folderName, parentFolderId },
  },
  handleSubmit,
  change,
  initialize,
}: DuplicateFolderModalProps &
  InjectedFormProps<DuplicateFolderFormValues, DuplicateFolderModalProps>) => {
  const { formatMessage } = useIntl();
  const folders = useSelector(transformedFoldersWithFullPathSelector);
  const { duplicateFolder, isLoading: isDuplicating } = useDuplicateFolder();
  const shouldMoveToRoot = useBooleanFormFieldValue<DuplicateFolderFormValues>({
    formName: DUPLICATE_FORM_NAME,
    fieldName: 'moveToRoot',
  });

  useEffect(() => {
    if (folderId) {
      const hasParentFolder = Boolean(parentFolderId);
      const parentFolder = hasParentFolder
        ? folders.find((folder) => Number(folder.id) === Number(parentFolderId))
        : null;

      initialize({
        folderName: `${folderName} (1)`,
        destinationFolder: parentFolder || null,
        moveToRoot: false,
        initialParentFolderId: parentFolderId,
      });
    }
  }, [folderId, folderName, parentFolderId, initialize, folders]);

  const onSubmit = (values: DuplicateFolderFormValues) => {
    const parentFolderId = values.moveToRoot
      ? null
      : coerceToNumericId(values.destinationFolder?.id);

    duplicateFolder({ folderId, folderName: values.folderName, parentFolderId }).catch(noop);
  };

  const customContent = (
    <div className={cx('folder-modal__text')}>
      {formatMessage(messages.duplicateFolderText, {
        b: (data) => <span className={cx('folder-modal__text--bold')}>{data}</span>,
        name: folderName,
      })}
    </div>
  );

  return (
    <FolderModal
      formName={DUPLICATE_FORM_NAME}
      title={formatMessage(commonMessages.duplicateFolder)}
      dirty={dirty}
      isLoading={isDuplicating}
      isToggled={shouldMoveToRoot}
      toggleLabel={formatMessage(messages.moveToRootDirectory)}
      toggleFieldName="moveToRoot"
      toggleDisabled={false}
      isInvertedToggle
      parentFolderFieldName="destinationFolder"
      parentFolderFieldLabel={formatMessage(commonFolderMessages.folderDestination)}
      customContent={customContent}
      excludeFolderIds={[folderId]}
      handleSubmit={handleSubmit}
      onSubmit={onSubmit}
      change={change}
    />
  );
});

export default withModal(DUPLICATE_FOLDER_MODAL_KEY)(DuplicateFolderModal);
