import { useState, useMemo } from 'react';
import { reduxForm, InjectedFormProps, FormErrors, SubmitHandler } from 'redux-form';
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import Parser from 'html-react-parser';
import Link from 'redux-first-router-link';
import { isEmpty } from 'es-toolkit/compat';
import { isString } from 'es-toolkit';
import { Modal, FileDropArea, AddCsvIcon } from '@reportportal/ui-kit';
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

import { messages } from './messages';
import { useImportTestCase } from './useImportTestCase';

import styles from './importTestCaseModal.scss';

export const IMPORT_TEST_CASE_MODAL_KEY = 'importTestCaseModalKey';
export const IMPORT_TEST_CASE_FORM_NAME = 'import-test-case-modal-form';
export type ImportTestCaseFormValues = {
  folderName: string;
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
  data,
  invalid,
}: InjectedFormProps<ImportTestCaseFormValues, ImportModalData> & ImportModalData) => {
  const { formatMessage } = useIntl();
  const [file, setFile] = useState<File | null>(null);
  const [folderIdFromUrl] = useState<number | undefined>(() =>
    extractFolderIdFromHash(window.location.hash),
  );
  const dispatch = useDispatch();
  const selectedFolderName = data?.folderName ?? '';
  const hasFolderIdFromUrl = folderIdFromUrl != null;

  const { isImportingTestCases, importTestCases } = useImportTestCase();

  const handleCancel = () => {
    dispatch(hideModalAction());
  };

  const acceptFileMimeTypes = useMemo<MimeType[]>(() => [...CSV_MIME_TYPES], []);

  const isAllowedMime = (file: File) => CSV_MIME_TYPES.includes(file.type as MimeType);

  const isWithinSize = (file: File) => file.size <= MAX_FILE_SIZE_BYTES;

  const handleImport = async (formValues: ImportTestCaseFormValues) => {
    const name = formValues.folderName?.trim() ?? '';
    const hasFolderIdFromUrl = folderIdFromUrl != null;

    if (!file || (!hasFolderIdFromUrl && !name)) {
      return;
    }

    if (hasFolderIdFromUrl) {
      await importTestCases({ file, testFolderId: folderIdFromUrl });
    } else {
      await importTestCases({ file, testFolderName: name });
    }
  };

  const attachedFiles: AttachmentFile[] = file
    ? [
        {
          id: uniqueId(),
          fileName: file.name,
          file,
          size: toMB(file.size),
        },
      ]
    : [];

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

    setFile(selectedFile);
  };

  const handleRemove = () => setFile(null);

  const handleDownload = () => {
    if (!file) {
      return;
    }

    downloadFileFromBlob(file);
  };

  const okButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.IMPORT),
    disabled: isImportingTestCases || !file || (!hasFolderIdFromUrl && invalid),
    onClick: handleSubmit(handleImport) as () => void,
  };

  const cancelButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    disabled: isImportingTestCases,
    onClick: handleCancel,
  };

  const iconMarkup = isString(ExternalLinkIcon) ? Parser(ExternalLinkIcon) : null;

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
                    files={attachedFiles}
                    onRemoveFile={handleRemove}
                    onDownloadFile={handleDownload}
                  />
                </div>
              </div>
            </FileDropArea>
          </div>
          <div className={cx('import-test-case-modal__input-control')}>
            {folderIdFromUrl ? (
              <>
                <label className={cx('import-test-case-modal__label')}>
                  {formatMessage(messages.importFolderNameLabel)}
                </label>
                <div className={cx('import-test-case-modal__static-value')}>
                  <span>{selectedFolderName}</span>
                </div>
              </>
            ) : (
              <FolderNameField
                label={formatMessage(messages.importFolderNameLabel)}
                helpText={formatMessage(messages.importFolderNameDescription)}
              />
            )}
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
    initialValues: { folderName: '' },
    validate: ({ folderName }): FormErrors<ImportTestCaseFormValues> => ({
      folderName: commonValidators.requiredField(folderName),
    }),
  })(ImportTestCaseModal),
);
