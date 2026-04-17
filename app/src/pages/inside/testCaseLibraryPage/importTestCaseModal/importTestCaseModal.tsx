import { useState } from 'react';
import { reduxForm, InjectedFormProps } from 'redux-form';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import Link from 'redux-first-router-link';
import { format } from 'date-fns';
import { isEmpty } from 'es-toolkit/compat';
import { Modal, FileDropArea, AddCsvIcon, ExternalLinkIcon } from '@reportportal/ui-kit';
import { VoidFn } from '@reportportal/ui-kit/common';
import { MIME_TYPES, MimeType, FileWithValidation } from '@reportportal/ui-kit/fileDropArea';
import { AttachmentFile } from '@reportportal/ui-kit/fileDropArea/attachedFilesList';

import { createClassnames, uniqueId } from 'common/utils';
import { UseModalData } from 'common/hooks';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { downloadFileFromBlob } from 'common/utils/fileUtils';
import { foldersSelector, FolderWithFullPath } from 'controllers/testCase';
import { urlFolderIdSelector } from 'controllers/pages';
import { withModal } from 'controllers/modal';
import { FieldErrorHint, FieldProvider } from 'components/fields';
import { useModalButtons } from 'hooks/useModalButtons';
import { commonMessages } from 'pages/inside/testCaseLibraryPage/commonMessages';
import { FolderNameField } from 'pages/inside/testCaseLibraryPage/testCaseFolders/modals/folderFormFields';
import { CreateFolderAutocomplete } from 'pages/inside/testCaseLibraryPage/testCaseFolders/shared/CreateFolderAutocomplete';
import { ButtonSwitcherOption } from 'pages/inside/common/buttonSwitcher';

import {
  FolderModalFormValues,
  FOLDER_MODAL_INITIAL_VALUES,
} from '../utils/folderModalFormConfig';
import { validateFolderModalForm } from '../utils/validateFolderModalForm';
import { getFolderFromFormValues } from '../utils/getFolderFromFormValues';
import { useImportTestCase } from './useImportTestCase';
import { messages } from './messages';

import styles from './importTestCaseModal.scss';

export const IMPORT_TEST_CASE_MODAL_KEY = 'importTestCaseModalKey';
export const IMPORT_TEST_CASE_FORM_NAME = 'import-test-case-modal-form';
const DEFAULT_FOLDER_NAME = `Import ${format(new Date(), 'dd.MM.yyyy')}`;

export type ImportTestCaseModalData = {
  folderId?: number;
};

const cx = createClassnames(styles);
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const CSV_MIME_TYPES: MimeType[] = [MIME_TYPES.csv, MIME_TYPES.xls, MIME_TYPES.plain];

type ImportModalProps = UseModalData<ImportTestCaseModalData>;

const toMB = (bytes: number) => +(bytes / (1024 * 1024)).toFixed(2);

export const ImportTestCaseModal = ({
  data,
  invalid,
  handleSubmit,
  change,
}: InjectedFormProps<FolderModalFormValues, ImportModalProps> & ImportModalProps) => {
  const { formatMessage } = useIntl();
  const [file, setFile] = useState<File | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<AttachmentFile[]>([]);
  const [fileError, setFileError] = useState<string | undefined>();
  const { isImportingTestCases, importTestCases } = useImportTestCase();
  const [currentMode, setCurrentMode] = useState(ButtonSwitcherOption.EXISTING);
  const folders = useSelector(foldersSelector);
  const urlFolderId = useSelector(urlFolderIdSelector);
  const folderIdFromUrl = urlFolderId ? Number(urlFolderId) : undefined;
  const folderId = data?.folderId ?? folderIdFromUrl;
  const selectedFolderName = folders.find((folder) => folder.id === folderId)?.name ?? '';

  const hasFolderId = folderId != null;
  const hasFolders = folders.length > 0;

  const handleModeChange = (mode: ButtonSwitcherOption) => {
    setCurrentMode(mode);

    if (mode === ButtonSwitcherOption.EXISTING) {
      change('mode', ButtonSwitcherOption.NEW);
      change('destinationFolder', undefined);
      change('folderName', DEFAULT_FOLDER_NAME);
      change('isRootFolder', true);
    } else {
      change('mode', ButtonSwitcherOption.EXISTING);
      change('folderName', '');
    }
  };

  const handleFolderSelect = (selectedItem: FolderWithFullPath | null) => {
    change('destinationFolder', selectedItem ?? undefined);
  };

  const handleImport = async (formValues: FolderModalFormValues) => {
    if (!file) {
      return;
    }

    setFileError(undefined);

    const folder = folderId == null ? getFolderFromFormValues(formValues) : null;

    if (folderId == null && !folder) {
      return;
    }

    const result = await importTestCases({
      file,
      ...(folderId != null ? { folderId } : { destination: folder ?? undefined }),
    });

    if (result) {
      setFileError(result);
    }
  };

  const handleFilesAdded = (incoming: FileWithValidation[]) => {
    const validFile = incoming.find(({ validationErrors }) => isEmpty(validationErrors));

    if (!validFile) {
      return;
    }

    const { file: selectedFile } = validFile;

    const attachment: AttachmentFile = {
      id: uniqueId(),
      fileName: selectedFile.name,
      file: selectedFile,
      size: toMB(selectedFile.size),
    };

    setFile(selectedFile);
    setAttachedFiles([attachment]);
    setFileError(undefined);
  };

  const handleRemove = (fileId: string) => {
    setAttachedFiles((prevFiles) => prevFiles.filter(({ id }) => id !== fileId));
    setFile(null);
    setFileError(undefined);
  };

  const filesWithError: AttachmentFile[] = attachedFiles.map((file) => ({
    ...file,
    customErrorMessage: fileError ?? file.customErrorMessage,
  }));

  const handleDownload = () => {
    if (!file) {
      return;
    }

    downloadFileFromBlob(file);
  };

  const renderFolderSection = () => {
    if (hasFolderId) {
      return (
        <div className={cx('import-test-case-modal__input-control')}>
          <label className={cx('import-test-case-modal__label')}>
            {formatMessage(messages.importFolderNameLabel)}
          </label>
          <div className={cx('import-test-case-modal__static-value')}>
            <span>{selectedFolderName}</span>
          </div>
        </div>
      );
    }

    if (hasFolders) {
      return (
        <>
          <div className={cx('import-test-case-modal__switcher')}>
            <div className={cx('import-test-case-modal__location-title')}>
              {formatMessage(messages.specifyLocation)}
            </div>
            <div className={cx('import-test-case-modal__switcher-buttons')}>
              <button
                type="button"
                className={cx('import-test-case-modal__switcher-btn', {
                  'import-test-case-modal__switcher-btn--active':
                    currentMode === ButtonSwitcherOption.EXISTING,
                })}
                onClick={() => handleModeChange(ButtonSwitcherOption.EXISTING)}
              >
                {formatMessage(messages.createNewRootFolder)}
              </button>
              <button
                type="button"
                className={cx('import-test-case-modal__switcher-btn', {
                  'import-test-case-modal__switcher-btn--active':
                    currentMode === ButtonSwitcherOption.NEW,
                })}
                onClick={() => handleModeChange(ButtonSwitcherOption.NEW)}
              >
                {formatMessage(messages.addToExistingFolder)}
              </button>
            </div>
          </div>
          {currentMode === ButtonSwitcherOption.EXISTING && (
            <FolderNameField
              label={formatMessage(messages.importFolderNameLabel)}
              helpText={formatMessage(messages.importFolderNameDescription)}
            />
          )}
          {currentMode === ButtonSwitcherOption.NEW && (
            <FieldProvider name="destinationFolder">
              <FieldErrorHint provideHint={false}>
                <CreateFolderAutocomplete
                  label={formatMessage(messages.importDropdownLabel)}
                  placeholder={formatMessage(messages.typeToSearchOrSelect)}
                  onChange={handleFolderSelect}
                />
              </FieldErrorHint>
            </FieldProvider>
          )}
        </>
      );
    }

    return (
      <FolderNameField
        label={formatMessage(messages.importFolderNameLabel)}
        helpText={formatMessage(messages.importFolderNameDescription)}
      />
    );
  };

  const { okButton, cancelButton, hideModal } = useModalButtons({
    okButtonText: formatMessage(COMMON_LOCALE_KEYS.IMPORT),
    isLoading: isImportingTestCases,
    isSubmitButtonDisabled: !file || !!fileError || (!hasFolderId && invalid),
    onSubmit: handleSubmit(handleImport) as () => void,
  });

  return (
    <Modal
      title={formatMessage(commonMessages.importTestCases)}
      okButton={okButton}
      className={cx('import-test-case-modal')}
      cancelButton={cancelButton}
      onClose={hideModal}
    >
      <form onSubmit={handleSubmit(handleImport) as VoidFn}>
        <div className={cx('import-test-case-modal__content')}>
          <section className={cx('import-test-case-modal__info-block')}>
            <p className={cx('import-test-case-modal__info-text')}>
              {formatMessage(messages.downloadDescription)}
            </p>
            <Link to="#" className={cx('import-test-case-modal__download-link')}>
              {formatMessage(messages.downloadTemplate)}
              <ExternalLinkIcon />
            </Link>
          </section>
          <div className={cx('import-test-case-modal__uploader')}>
            <FileDropArea
              messages={{
                incorrectFileFormat: formatMessage(messages.incorrectFileFormat),
                incorrectFileSize: formatMessage(messages.incorrectFileSize),
              }}
              acceptFileMimeTypes={CSV_MIME_TYPES}
              maxFileSize={MAX_FILE_SIZE_BYTES}
              onFilesAdded={handleFilesAdded}
            >
              <div className={cx('import-test-case-modal__drop-wrap')}>
                <FileDropArea.DropZone
                  className={cx('import-test-case-modal__drop-zone')}
                  icon={<AddCsvIcon />}
                  description={
                    <>
                      {formatMessage(messages.dropCsvOr)}{' '}
                      <FileDropArea.BrowseButton>
                        {formatMessage(messages.browse)}
                      </FileDropArea.BrowseButton>{' '}
                      {formatMessage(messages.toAttach)}
                    </>
                  }
                  fileSizeMessage={formatMessage(messages.fileSizeMessage, {
                    size: MAX_FILE_SIZE_MB,
                  })}
                />
                <FileDropArea.Error />
                <div className={cx('import-test-case-modal__files')}>
                  <FileDropArea.AttachedFilesList
                    className={cx('import-test-case-modal__files')}
                    files={filesWithError}
                    onRemoveFile={handleRemove}
                    onDownloadFile={handleDownload}
                  />
                </div>
              </div>
            </FileDropArea>
          </div>
          {renderFolderSection()}
        </div>
      </form>
    </Modal>
  );
};

export default withModal(IMPORT_TEST_CASE_MODAL_KEY)(
  reduxForm<FolderModalFormValues>({
    form: IMPORT_TEST_CASE_FORM_NAME,
    destroyOnUnmount: true,
    initialValues: {
      ...FOLDER_MODAL_INITIAL_VALUES,
      mode: ButtonSwitcherOption.NEW,
      folderName: DEFAULT_FOLDER_NAME,
      isRootFolder: true,
    },
    validate: (values) => validateFolderModalForm(values),
  })(ImportTestCaseModal),
);
