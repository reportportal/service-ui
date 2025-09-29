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

import { ChangeEvent, useState, useMemo, HtmlHTMLAttributes } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import {
  reduxForm,
  registerField,
  unregisterField,
  InjectedFormProps,
  formValueSelector,
} from 'redux-form';
import classNames from 'classnames/bind';
import { Modal, FieldText, Toggle, FieldLabel } from '@reportportal/ui-kit';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { hideModalAction, withModal } from 'controllers/modal';
import { FieldErrorHint, FieldProvider } from 'components/fields';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';
import { ModalLoadingOverlay } from 'components/modalLoadingOverlay';
import { commonValidators } from 'common/utils/validation';
import { createFoldersAction } from 'controllers/testCase/actionCreators';
import { foldersSelector, isCreatingFolderSelector } from 'controllers/testCase';

import { commonMessages } from '../../commonMessages';

import styles from './createFolderModal.scss';
import { SingleAutocomplete } from 'componentLibrary/autocompletes/singleAutocomplete';
import { buildFoldersMap, traverseFolders } from './utils';
import { FolderWithFullPath } from './types';
import { AutocompleteOption } from 'componentLibrary/autocompletes/common/autocompleteOption';

const messages = defineMessages({
  enterFolderName: {
    id: 'TestCaseLibraryPage.enterFolderName',
    defaultMessage: 'Enter folder name',
  },
  createAsSubfolder: {
    id: 'TestCaseLibraryPage.createAsSubfolder',
    defaultMessage: 'Create as subfolder',
  },
  parentFolder: {
    id: 'TestCaseLibraryPage.parentFolder',
    defaultMessage: 'Parent folder',
  },
  searchFolderToSelect: {
    id: 'TestCaseLibraryPage.searchFolderToSelect',
    defaultMessage: 'Search folder to select',
  },
});

const cx = classNames.bind(styles) as typeof classNames;

export const CREATE_FOLDER_MODAL_KEY = 'createFolderModalKey';
const MAX_FIELD_LENGTH = 48;

export interface CreateFolderFormValues {
  folderName: string;
  parentFolderName?: string;
}
interface CreateFolderModalProps {
  data: {
    shouldRenderToggle: boolean;
  };
}

const CreateFolderModalComponent = ({
  data: { shouldRenderToggle },
  dirty,
  handleSubmit,
  change,
  untouch,
}: CreateFolderModalProps & InjectedFormProps<CreateFolderFormValues, CreateFolderModalProps>) => {
  const currentFormSelector = formValueSelector('create-folder-modal-form');
  const dispatch = useDispatch();
  const parentFolderName = useSelector<CreateFolderFormValues>((state) =>
    currentFormSelector(state, 'parentFolderName'),
  );
  const folderName = useSelector<CreateFolderFormValues>((state) =>
    currentFormSelector(state, 'folderName'),
  );
  const isCreatingFolder = useSelector(isCreatingFolderSelector);
  const folders = useSelector(foldersSelector);
  const { formatMessage } = useIntl();

  const selectedFolder = folders.find((folder) => folder.id === parentFolderName);

  const [isSubfolderToggled, setIsSubfolderToggled] = useState(false);

  // Going to be resolved to id by folder name with UI search control
  // Currently directly accepts id from name input
  const coerceToNumericId = (value: unknown): number | undefined => {
    if (value == null || value === '') return undefined;
    const id = Number(value);
    return Number.isFinite(id) ? id : undefined;
  };

  const hideModal = () => dispatch(hideModalAction());

  const handleSelectedFolder = ({ selectedItem }: { selectedItem: FolderWithFullPath }) => {
    change('parentFolderName', selectedItem?.id || '');
  };

  const mappedFolders = useMemo(() => traverseFolders(buildFoldersMap(folders)), [folders]);

  const renderOption = (
    option: FolderWithFullPath,
    index: number,
    _isNew: boolean,
    getItemProps: ({
      item,
      index,
    }: {
      item: FolderWithFullPath;
      index: number;
    }) => HtmlHTMLAttributes<HTMLDivElement>,
  ) => (
    <AutocompleteOption
      isActive={true}
      isSelected={true}
      disabled={false}
      optionVariant=""
      variant="light"
      {...getItemProps({ item: option, index })}
      key={option.id}
      isNew={false}
      parseValueToString={(item: FolderWithFullPath) => item.description || ''}
    >
      <>
        <p className={cx('create-folder-modal__folder__name')}>
          {option.description || option.name}
        </p>
        <p className={cx('create-folder-modal__folder__path')}>{option.fullPath}</p>
      </>
    </AutocompleteOption>
  );

  const onSubmit = () => {
    const idFromNameInput = coerceToNumericId(parentFolderName);

    dispatch(
      createFoldersAction({
        folderName: folderName as string,
        ...(idFromNameInput !== undefined ? { parentFolderId: idFromNameInput } : {}),
      }),
    );
    hideModal();
  };

  const handleToggle = ({ target }: ChangeEvent<HTMLInputElement>) => {
    if (target.checked) {
      dispatch(registerField('create-folder-modal-form', 'parentFolderName', 'Field'));
      untouch('parentFolderName');
    } else {
      dispatch(unregisterField('create-folder-modal-form', 'parentFolderName'));
    }
    setIsSubfolderToggled(target.checked);
  };

  const okButton = {
    children: (
      <LoadingSubmitButton isLoading={isCreatingFolder}>
        {formatMessage(COMMON_LOCALE_KEYS.CREATE)}
      </LoadingSubmitButton>
    ),
    type: 'submit' as const,
    onClick: onSubmit,
    disabled: isCreatingFolder,
    'data-automation-id': 'submitButton',
  };

  const cancelButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    disabled: isCreatingFolder,
    'data-automation-id': 'cancelButton',
  };

  return (
    <Modal
      title={formatMessage(commonMessages.createFolder)}
      okButton={okButton}
      cancelButton={cancelButton}
      allowCloseOutside={!dirty}
      onClose={hideModal}
    >
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
      <form onSubmit={handleSubmit(onSubmit)} className={cx('create-folder-modal__form')}>
        <FieldProvider name="folderName" placeholder={formatMessage(messages.enterFolderName)}>
          <FieldErrorHint provideHint={false}>
            <FieldText
              label={formatMessage(COMMON_LOCALE_KEYS.NAME)}
              defaultWidth={false}
              maxLength={MAX_FIELD_LENGTH}
              maxLengthDisplay={MAX_FIELD_LENGTH}
            />
          </FieldErrorHint>
        </FieldProvider>
        {shouldRenderToggle && (
          <Toggle
            value={isSubfolderToggled}
            onChange={handleToggle}
            className={cx('create-folder-modal__toggle')}
          >
            {formatMessage(messages.createAsSubfolder)}
          </Toggle>
        )}
        {isSubfolderToggled && (
          <>
            <FieldProvider
              name="parentFolderName"
              className={cx('create-folder-modal__parent-folder')}
              placeholder={formatMessage(messages.searchFolderToSelect)}
            >
              <FieldErrorHint provideHint={false}>
                <>
                  <FieldLabel isRequired={false}>{formatMessage(messages.parentFolder)}</FieldLabel>
                  <SingleAutocomplete
                    name="parentFolderName"
                    value={selectedFolder || ''}
                    optionVariant="key-variant"
                    createWithoutConfirmation={false}
                    onStateChange={handleSelectedFolder}
                    placeholder={formatMessage(messages.searchFolderToSelect)}
                    options={mappedFolders}
                    customEmptyListMessage={formatMessage(commonMessages.noTestPlanCreated)}
                    renderOption={renderOption}
                    parseValueToString={(option: FolderWithFullPath) =>
                      (option?.description || option?.name)?.toString() || ''
                    }
                  />
                </>
              </FieldErrorHint>
            </FieldProvider>
          </>
        )}
        <ModalLoadingOverlay isVisible={isCreatingFolder} />
      </form>
    </Modal>
  );
};

export default withModal(CREATE_FOLDER_MODAL_KEY)(
  reduxForm<CreateFolderFormValues, CreateFolderModalProps>({
    form: 'create-folder-modal-form',
    initialValues: {
      folderName: '',
      parentFolderName: '',
    },
    shouldValidate: () => true, // need this to force validation on parentFolderName after re-registering it
    validate: ({ folderName, parentFolderName }) => {
      return {
        folderName: commonValidators.requiredField(folderName),
        parentFolderName: commonValidators.requiredField(parentFolderName),
      };
    },
  })(CreateFolderModalComponent),
);
