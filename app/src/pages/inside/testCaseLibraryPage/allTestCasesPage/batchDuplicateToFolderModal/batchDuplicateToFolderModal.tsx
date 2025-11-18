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

import { useState, useCallback, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { reduxForm, InjectedFormProps, formValueSelector } from 'redux-form';
import { noop } from 'es-toolkit';
import { Modal } from '@reportportal/ui-kit';

import { UseModalData } from 'common/hooks';
import { createClassnames } from 'common/utils';
import { withModal, hideModalAction } from 'controllers/modal';
import { commonValidators } from 'common/utils/validation';
import { coerceToNumericId } from 'pages/inside/testCaseLibraryPage/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ModalLoadingOverlay } from 'components/modalLoadingOverlay';
import { ButtonSwitcher, ButtonSwitcherOption } from 'pages/inside/common/buttonSwitcher';
import { FieldProvider, FieldErrorHint } from 'components/fields';
import { FolderWithFullPath } from 'controllers/testCase';

import { CreateFolderForm } from '../../testCaseFolders/shared/CreateFolderForm';
import { CreateFolderAutocomplete } from '../../testCaseFolders/shared/CreateFolderAutocomplete';
import { sharedFolderMessages } from '../../testCaseFolders/modals/messages';
import { commonMessages as testCaseCommonMessages } from '../../commonMessages';
import { useBatchDuplicateToFolder } from './useBatchDuplicateToFolder';
import { messages } from './messages';

import styles from './batchDuplicateToFolderModal.scss';
import { SingleAutocompleteProps } from '@reportportal/ui-kit/components/autocompletes/singleAutocomplete/singleAutocomplete';

const cx = createClassnames(styles);

export const BATCH_DUPLICATE_TO_FOLDER_MODAL_KEY = 'batchDuplicateToFolderModalKey';
const BATCH_DUPLICATE_TO_FOLDER_FORM = 'batchDuplicateToFolderForm';

export interface BatchDuplicateToFolderModalData {
  selectedTestCaseIds: number[];
  count: number;
}

interface BatchDuplicateToFolderFormValues {
  mode?: ButtonSwitcherOption;
  destinationFolder?: { id: number };
  folderName?: string;
  parentFolder?: { id: number };
  isRootFolder?: boolean;
}

type BatchDuplicateToFolderModalProps = UseModalData<BatchDuplicateToFolderModalData>;

const BatchDuplicateToFolderModal = reduxForm<
  BatchDuplicateToFolderFormValues,
  BatchDuplicateToFolderModalProps
>({
  form: BATCH_DUPLICATE_TO_FOLDER_FORM,
  destroyOnUnmount: true,
  shouldValidate: () => true,
  validate: (values, props) => {
    const errors: Partial<Record<keyof BatchDuplicateToFolderFormValues, string>> = {};

    if (props.data) {
      const isExistingMode = values.mode === ButtonSwitcherOption.EXISTING;

      if (isExistingMode) {
        errors.destinationFolder = commonValidators.requiredField(values.destinationFolder);
      } else {
        errors.folderName = commonValidators.requiredField(values.folderName);

        if (!values.isRootFolder) {
          errors.parentFolder = commonValidators.requiredField(values.parentFolder);
        }
      }
    }

    return errors;
  },
  initialValues: {
    mode: ButtonSwitcherOption.EXISTING,
    destinationFolder: undefined,
    folderName: '',
    parentFolder: undefined,
    isRootFolder: false,
  },
})(({
  dirty,
  handleSubmit,
  change,
  data,
}: BatchDuplicateToFolderModalProps &
  InjectedFormProps<BatchDuplicateToFolderFormValues, BatchDuplicateToFolderModalProps>) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { isLoading, batchDuplicate } = useBatchDuplicateToFolder();
  const [currentMode, setCurrentMode] = useState(ButtonSwitcherOption.EXISTING);

  const selectedTestCaseIds = useMemo(
    () => data?.selectedTestCaseIds || [],
    [data?.selectedTestCaseIds],
  );
  const count = data?.count || 0;

  const selector = formValueSelector(BATCH_DUPLICATE_TO_FOLDER_FORM);
  const isRootFolder = Boolean(
    useSelector((state) => selector(state, 'isRootFolder') as boolean | undefined),
  );

  const handleModeChange = useCallback(
    (mode: ButtonSwitcherOption) => {
      setCurrentMode(mode);
      change('mode', mode);

      if (mode === ButtonSwitcherOption.EXISTING) {
        change('folderName', '');
        change('parentFolder', undefined);
        change('isRootFolder', false);
      } else {
        change('destinationFolder', undefined);
      }
    },
    [change],
  );

  const handleFolderSelect: SingleAutocompleteProps<FolderWithFullPath>['onStateChange'] =
    useCallback(
      ({ selectedItem }) => {
        change('destinationFolder', selectedItem);
      },
      [change],
    );

  const onSubmit = useCallback(
    (values: BatchDuplicateToFolderFormValues) => {
      if (currentMode === ButtonSwitcherOption.EXISTING) {
        const testFolderId = coerceToNumericId(values.destinationFolder?.id);

        if (testFolderId) {
          batchDuplicate({
            testCaseIds: selectedTestCaseIds,
            testFolderId,
          }).catch(noop);
        }
      } else {
        batchDuplicate({
          testCaseIds: selectedTestCaseIds,
          testFolder: {
            name: values.folderName || '',
            parentTestFolderId: coerceToNumericId(values.parentFolder?.id ?? null),
          },
        }).catch(noop);
      }
    },
    [currentMode, batchDuplicate, selectedTestCaseIds],
  );

  const hideModal = () => dispatch(hideModalAction());

  const description = (
    <div className={cx('batch-duplicate-modal__description')}>
      {formatMessage(messages.batchDuplicateDescription, {
        count,
        b: (text) => <b>{text}</b>,
      })}
    </div>
  );

  const okButton = useMemo(
    () => ({
      children: formatMessage(COMMON_LOCALE_KEYS.DUPLICATE),
      disabled: isLoading,
      onClick: handleSubmit(onSubmit) as () => void,
    }),
    [formatMessage, handleSubmit, onSubmit, isLoading],
  );

  const cancelButton = useMemo(
    () => ({
      children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      disabled: isLoading,
    }),
    [formatMessage, isLoading],
  );

  return (
    <Modal
      title={formatMessage(messages.batchDuplicateToFolderTitle)}
      okButton={okButton}
      cancelButton={cancelButton}
      allowCloseOutside={!dirty}
      onClose={hideModal}
    >
      <form className={cx('batch-duplicate-modal__form')}>
        <ButtonSwitcher
          description={description}
          existingButtonTitle={formatMessage(messages.duplicateToExistingFolder)}
          createNewButtonTitle={formatMessage(messages.createNewFolder)}
          handleActiveButton={handleModeChange}
        />
        {currentMode === ButtonSwitcherOption.EXISTING && (
          <FieldProvider name="destinationFolder">
            <FieldErrorHint provideHint={false}>
              <CreateFolderAutocomplete
                name="destinationFolder"
                label={formatMessage(sharedFolderMessages.folderDestination)}
                placeholder={formatMessage(testCaseCommonMessages.searchFolderToSelect)}
                onStateChange={handleFolderSelect}
                className={cx('batch-duplicate-modal__autocomplete')}
              />
            </FieldErrorHint>
          </FieldProvider>
        )}
        {currentMode === ButtonSwitcherOption.NEW && (
          <CreateFolderForm
            isToggled={isRootFolder}
            toggleLabel={formatMessage(messages.duplicateToRootDirectory)}
            toggleFieldName="isRootFolder"
            parentFolderFieldName="parentFolder"
            parentFolderFieldLabel={formatMessage(sharedFolderMessages.parentFolder)}
            folderNameFieldName="folderName"
            toggleDisabled={false}
            isInvertedToggle
            change={change}
          />
        )}
        <ModalLoadingOverlay isVisible={isLoading} />
      </form>
    </Modal>
  );
});

export default withModal(BATCH_DUPLICATE_TO_FOLDER_MODAL_KEY)(BatchDuplicateToFolderModal);
