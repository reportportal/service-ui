import { useState, useMemo, useEffect } from 'react';
import { reduxForm, InjectedFormProps, FormErrors, SubmitHandler } from 'redux-form';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import Parser from 'html-react-parser';
import Link from 'redux-first-router-link';
import { isEmpty } from 'es-toolkit/compat';
import { isString } from 'es-toolkit';
import { format } from 'date-fns';
import { Modal, FileDropArea, AddCsvIcon, Dropdown } from '@reportportal/ui-kit';
import { MIME_TYPES, MimeType } from '@reportportal/ui-kit/fileDropArea';
import { AttachmentFile } from '@reportportal/ui-kit/fileDropArea/attachedFilesList';

import { withModal, hideModalAction } from 'controllers/modal';
import { commonValidators, createClassnames } from 'common/utils';
import { UseModalData } from 'common/hooks';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { downloadFileFromBlob } from 'common/utils/fileUtils';
import ExternalLinkIcon from 'common/img/open-in-rounded-inline.svg';
import { uniqueId } from 'common/utils';
import { commonMessages } from 'pages/inside/testCaseLibraryPage/commonMessages';
import { FolderNameField } from 'pages/inside/testCaseLibraryPage/testCaseFolders/modals/folderFormFields';
import { Folder, foldersSelector } from 'controllers/testCase';

import { useImportTestCase } from './useImportTestCase';

import { messages } from './messages';

import styles from './importTestCaseModal.scss';

export const IMPORT_TEST_CASE_MODAL_KEY = 'importTestCaseModalKey';
export const IMPORT_TEST_CASE_FORM_NAME = 'import-test-case-modal-form';
const DEFAULT_FOLDER_NAME = `Import ${format(new Date(), 'dd.MM.yyyy')}`;
export type ImportTarget = 'root' | 'existing';
export type ImportTestCaseFormValues = {
  folderName: string;
  importTarget?: ImportTarget;
};

const cx = createClassnames(styles);
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const CSV_MIME_TYPES: MimeType[] = [MIME_TYPES.csv, MIME_TYPES.xls, MIME_TYPES.plain];

type FileLike = File | { file: File };
type FileInput = FileLike | FileLike[];
type ImportModalData = UseModalData<ImportTestCaseFormValues>;
type ImportTestCaseSubmitHandler = SubmitHandler<ImportTestCaseFormValues, ImportModalData>;

const extractFolderIdFromHash = (hash: string): number | undefined => {
  const match = /\/testLibrary\/folder\/(\d+)/i.exec(hash);

  return match ? Number.parseInt(match[1], 10) : undefined;
};

const toMB = (bytes: number) => +(bytes / (1024 * 1024)).toFixed(2);

export const ImportTestCaseModal = ({
  handleSubmit,
  change,
  data,
  invalid,
  error,
}: InjectedFormProps<ImportTestCaseFormValues, ImportModalData> & ImportModalData) => {
  const { formatMessage } = useIntl();
  const selectedFolderName = data?.folderName ?? '';
  const predefinedImportTarget = data?.importTarget;
  const folders = useSelector(foldersSelector);
  const folderIdFromName = folders.find((folder) => folder.name === selectedFolderName)?.id;
  const folderIdFromUrl = extractFolderIdFromHash(window.location.hash);
  const folderId = predefinedImportTarget === 'existing' ? folderIdFromName : folderIdFromUrl;
  const [file, setFile] = useState<File | null>(null);
  const [target, setTarget] = useState<ImportTarget>(folderId != null ? 'existing' : 'root');
  const [existingFolderId, setExistingFolderId] = useState<number | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<AttachmentFile[]>([]);
  const dispatch = useDispatch();

  const { isImportingTestCases, importTestCases } = useImportTestCase();

  const handleCancel = () => {
    dispatch(hideModalAction());
  };

  const setTargetAndForm = (next: ImportTarget) => {
    setTarget(next);
    change('importTarget', next);
  };

  const existingOptions = useMemo(
    () =>
      (Array.isArray(folders) ? folders : []).map((folder: Folder) => ({
        value: folder.id,
        label: folder.name,
      })),
    [folders],
  );

  const acceptFileMimeTypes = useMemo<MimeType[]>(() => [...CSV_MIME_TYPES], []);

  useEffect(() => {
    change('importTarget', target);

    if (folderId && existingOptions.some(({ value }) => Number(value) === folderId)) {
      setExistingFolderId(folderId);
    }
  }, [folderId, existingOptions, change]);

  const isAllowedMime = (file: File) => CSV_MIME_TYPES.includes(file.type as MimeType);

  const isWithinSize = (file: File) => file.size <= MAX_FILE_SIZE_BYTES;

  const isRootTarget = target === 'root';
  const isExistingTarget = target === 'existing';
  const hasExistingOptions = !isEmpty(existingOptions);
  const hasFolderId = folderId != null;

  const handleImport = async (formValues: ImportTestCaseFormValues) => {
    const name = formValues.folderName?.trim() ?? '';
    const importTarget = formValues.importTarget ?? 'root';

    if (!file || (importTarget === 'root' && !name)) {
      return;
    }

    if (importTarget === 'existing') {
      const resolvedId = existingFolderId ?? folderId;

      if (!file || resolvedId == null) {
        return;
      }

      await importTestCases({ file, testFolderId: resolvedId });
    } else {
      if (!file || !name) {
        return;
      }

      await importTestCases({ file, testFolderName: name });
    }
  };

  const handleFilesAdded = (incoming: FileInput) => {
    const items = Array.isArray(incoming) ? incoming : [incoming];

    if (isEmpty(items)) {
      return;
    }

    const selectedFile = items
      .map((item) => (item instanceof File ? item : item.file))
      .find((file) => isAllowedMime(file) && isWithinSize(file));

    if (!selectedFile) {
      return;
    }

    const attachment: AttachmentFile = {
      id: uniqueId(),
      fileName: selectedFile.name,
      file: selectedFile,
      size: toMB(selectedFile.size),
    };

    setFile(selectedFile);
    setAttachedFiles([attachment]);
  };

  const handleRemove = (fileId: string) => {
    setAttachedFiles((prevFiles) => prevFiles.filter(({ id }) => id !== fileId));
    setFile(null);
  };

  const filesWithError: AttachmentFile[] = attachedFiles.map((file) => ({
    ...file,
    customErrorMessage: error ?? file.customErrorMessage,
  }));

  const handleDownload = () => {
    if (!file) {
      return;
    }

    downloadFileFromBlob(file);
  };

  const okButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.IMPORT),
    disabled: isImportingTestCases || !file || (!hasFolderId && invalid),
    onClick: handleSubmit(handleImport) as () => void,
  };

  const cancelButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    disabled: isImportingTestCases,
    onClick: handleCancel,
  };

  const iconMarkup = isString(ExternalLinkIcon) ? Parser(ExternalLinkIcon) : null;

  const handleExistingFolderChange = (value: number) => {
    setExistingFolderId(value);
  };

  const renderLocationControl = () => {
    if (hasFolderId) {
      return (
        <>
          <label className={cx('import-test-case-modal__label')}>
            {formatMessage(messages.importFolderNameLabel)}
          </label>
          <div className={cx('import-test-case-modal__static-value')}>
            <span>{selectedFolderName}</span>
          </div>
        </>
      );
    }

    if (isExistingTarget && hasExistingOptions) {
      return (
        <>
          <label className={cx('import-test-case-modal__label')}>
            {formatMessage(messages.importDropdownLabel)}
          </label>
          <Dropdown
            className={cx('import-test-case-modal__dropdown')}
            options={existingOptions}
            value={existingFolderId ?? undefined}
            placeholder={formatMessage(messages.typeToSearchOrSelect)}
            onChange={handleExistingFolderChange}
          />
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

  return (
    <Modal
      title={formatMessage(commonMessages.importTestCases)}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={handleCancel}
      className={cx('import-test-case-modal')}
    >
      <form onSubmit={handleSubmit(handleImport) as ImportTestCaseSubmitHandler}>
        <div className={cx('import-test-case-modal__content')}>
          <section className={cx('import-test-case-modal__info-block')}>
            <p className={cx('import-test-case-modal__info-text')}>
              {formatMessage(messages.downloadDescription)}
            </p>
            <Link to="#" className={cx('import-test-case-modal__download-link')}>
              {formatMessage(messages.downloadTemplate)}
              <i className={cx('import-test-case-modal__external-icon')}>{iconMarkup}</i>
            </Link>
          </section>
          <div className={cx('import-test-case-modal__uploader')}>
            <FileDropArea
              messages={{
                incorrectFileFormat: formatMessage(messages.incorrectFileFormat),
                incorrectFileSize: formatMessage(messages.incorrectFileSize),
              }}
              acceptFileMimeTypes={acceptFileMimeTypes}
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
          {!hasFolderId && (
            <section className={cx('import-test-case-modal__location-block')}>
              <div className={cx('import-test-case-modal__location-title')}>
                {formatMessage(messages.specifyLocation)}
              </div>
              <div className={cx('import-test-case-modal__segmented')}>
                <button
                  type="button"
                  className={cx('import-test-case-modal__segmented-btn', {
                    'is-active': isRootTarget,
                  })}
                  aria-pressed={isRootTarget}
                  onClick={() => setTargetAndForm('root')}
                >
                  {formatMessage(messages.createNewRootFolder)}
                </button>
                <button
                  type="button"
                  className={cx('import-test-case-modal__segmented-btn', {
                    'is-active': isExistingTarget,
                  })}
                  aria-pressed={isExistingTarget}
                  onClick={() => setTargetAndForm('existing')}
                >
                  {formatMessage(messages.addToExistingFolder)}
                </button>
              </div>
            </section>
          )}
          <div className={cx('import-test-case-modal__input-control')}>
            {renderLocationControl()}
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default withModal(IMPORT_TEST_CASE_MODAL_KEY)(
  reduxForm<ImportTestCaseFormValues>({
    form: IMPORT_TEST_CASE_FORM_NAME,
    destroyOnUnmount: true,
    initialValues: { folderName: DEFAULT_FOLDER_NAME, importTarget: undefined },
    validate: ({
      importTarget,
      folderName,
    }: ImportTestCaseFormValues): FormErrors<ImportTestCaseFormValues> => {
      const needName =
        importTarget === 'root' || extractFolderIdFromHash(window.location.hash) == null;

      return {
        folderName: needName ? commonValidators.requiredField(folderName) : undefined,
      };
    },
  })(ImportTestCaseModal),
);
