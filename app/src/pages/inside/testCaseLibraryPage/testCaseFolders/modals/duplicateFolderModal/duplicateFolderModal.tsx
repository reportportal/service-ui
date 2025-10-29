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
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { reduxForm, InjectedFormProps, formValueSelector } from 'redux-form';

import { UseModalData } from 'common/hooks';
import { createClassnames } from 'common/utils';
import { withModal } from 'controllers/modal';
import { TransformedFolder, transformedFoldersWithFullPathSelector } from 'controllers/testCase';
import { commonValidators } from 'common/utils/validation';
import { duplicateFolderAction } from 'controllers/testCase/actionCreators';
import { isCreatingFolderSelector } from 'controllers/testCase/selectors';
import { coerceToNumericId } from 'pages/inside/testCaseLibraryPage/utils';
import { commonMessages } from 'pages/inside/testCaseLibraryPage/commonMessages';

import { sharedFolderMessages } from '../messages';
import { DUPLICATE_FORM_NAME } from '../constants';
import { messages } from './messages';
import { DuplicateFolderFormValues } from '../types';
import { FolderModal } from '../folderModal';

import styles from '../folderModal/folderModal.scss';

const cx = createClassnames(styles);
const selector = formValueSelector(DUPLICATE_FORM_NAME);

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
  untouch,
  initialize,
}: DuplicateFolderModalProps &
  InjectedFormProps<DuplicateFolderFormValues, DuplicateFolderModalProps>) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const folders = useSelector(transformedFoldersWithFullPathSelector);
  const isCreatingFolder = useSelector(isCreatingFolderSelector);
  const shouldMoveToRoot = Boolean(
    useSelector((state) => selector(state, 'moveToRoot') as boolean | undefined),
  );

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

    dispatch(
      duplicateFolderAction({
        folderName: values.folderName,
        ...(parentFolderId ? { parentFolderId } : {}),
      }),
    );
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
      title={formatMessage(commonMessages.duplicateFolder)}
      dirty={dirty}
      isLoading={isCreatingFolder}
      isToggled={shouldMoveToRoot}
      toggleLabel={formatMessage(messages.moveToRootDirectory)}
      toggleFieldName="moveToRoot"
      toggleDisabled={false}
      isInvertedToggle
      parentFolderFieldName="destinationFolder"
      parentFolderFieldLabel={formatMessage(sharedFolderMessages.folderDestination)}
      formName={DUPLICATE_FORM_NAME}
      customContent={customContent}
      handleSubmit={handleSubmit}
      onSubmit={onSubmit}
      change={change}
      untouch={untouch}
    />
  );
});

export default withModal(DUPLICATE_FOLDER_MODAL_KEY)(DuplicateFolderModal);
