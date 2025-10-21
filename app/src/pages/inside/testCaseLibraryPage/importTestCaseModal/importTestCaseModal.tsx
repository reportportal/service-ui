import { useState, useMemo } from 'react';
import { reduxForm, InjectedFormProps, FormErrors } from 'redux-form';
import { useIntl } from 'react-intl';
import Parser from 'html-react-parser';
import Link from 'redux-first-router-link';
import { isString } from 'es-toolkit';
import { Modal, FileDropArea, AddCsvIcon, MIME_TYPES } from '@reportportal/ui-kit';
import type { MimeType } from '@reportportal/ui-kit/dist/components/fileDropArea/types';
import { useImportTestCase } from './useImportTestCase';
import { withModal } from 'controllers/modal';
import { FolderNameField } from 'pages/inside/testCaseLibraryPage/testCaseFolders/modals/folderFormFields';

import { commonValidators, createClassnames } from 'common/utils';
import { commonMessages } from 'pages/inside/testCaseLibraryPage/commonMessages';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { downloadFileFromBlob } from 'common/utils/fileUtils';
import ExternalLinkIcon from 'common/img/open-in-rounded-inline.svg';

import { messages } from './messages';

import styles from './importTestCaseModal.scss';
import { AttachmentFile } from '@reportportal/ui-kit/dist/components/fileDropArea/attachedFilesList';

export const IMPORT_TEST_CASE_MODAL_KEY = 'importTestCaseModalKey';
export const IMPORT_TEST_CASE_FORM_NAME: string = 'import-test-case-modal-form';

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const CSV_MIME_TYPES: MimeType[] = [MIME_TYPES.csv, MIME_TYPES.xls, MIME_TYPES.plain];

const cx = createClassnames(styles);

type FileLike = File | { file: File };
type FileInput = FileLike | FileLike[];
type ImportTestCaseFormValues = {
  folderName: string;
};

const extractFolderIdFromHash = (hash: string): number | undefined => {
  const match = /\/testLibrary\/folder\/(\d+)/i.exec(hash);
  return match ? parseInt(match[1], 10) : undefined;
};

const toMB = (bytes: number) => +(bytes / (1024 * 1024)).toFixed(2);

export const ImportTestCaseModal = ({
  handleSubmit,
}: InjectedFormProps<ImportTestCaseFormValues>) => {
  const { formatMessage } = useIntl();
  const [file, setFile] = useState<File | null>(null);
  const [folderIdFromUrl] = useState<number | undefined>(() =>
    extractFolderIdFromHash(window.location.hash),
  );
  const { isImportingTestCases, importTestCases } = useImportTestCase();

  const acceptFileMimeTypes = useMemo<MimeType[]>(() => [...CSV_MIME_TYPES], []);

  const handleImport: (formValues: ImportTestCaseFormValues) => Promise<void> = async (
    formValues: ImportTestCaseFormValues,
  ) => {
    const name = formValues.folderName?.trim() ?? '';

    if (!file || (folderIdFromUrl == null && !name)) {
      return;
    }

    if (folderIdFromUrl != null) {
      await importTestCases({ file, testFolderId: folderIdFromUrl });
    } else {
      await importTestCases({ file, testFolderName: name });
    }
  };

  const attachedFiles: AttachmentFile[] = file
    ? [
        {
          id: crypto.randomUUID(),
          fileName: file.name,
          file,
          size: toMB(file.size),
        },
      ]
    : [];

  const handleFilesAdded = (incoming: FileInput) => {
    const items = Array.isArray(incoming) ? incoming : [incoming];

    if (!items.length) {
      return;
    }

    const next = items[0] instanceof File ? items[0] : items[0].file;
    setFile(next);
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
    onClick: handleSubmit(handleImport) as () => void,
    disabled: isImportingTestCases || !file,
  };

  const cancelButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    disabled: isImportingTestCases,
  };

  const iconMarkup = isString(ExternalLinkIcon) ? Parser(ExternalLinkIcon) : null;

  return (
    <Modal
      title={formatMessage(commonMessages.importTestCases)}
      okButton={okButton}
      cancelButton={cancelButton}
      className={cx('import-test-case-modal')}
    >
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
      <form onSubmit={handleSubmit(handleImport)}>
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
              onFilesAdded={handleFilesAdded}
              acceptFileMimeTypes={acceptFileMimeTypes}
              maxFileSize={MAX_FILE_SIZE_BYTES}
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
                {file && (
                  <div className={cx('import-test-case-modal__files')}>
                    <FileDropArea.AttachedFilesList
                      className={cx('import-test-case-modal__files')}
                      files={attachedFiles}
                      onRemoveFile={handleRemove}
                      onDownloadFile={handleDownload}
                    />
                  </div>
                )}
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
                  <span>{formatMessage(messages.selectedFolderName)}</span>
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
    initialValues: {
      folderName: '',
    },
    validate: ({ folderName }): FormErrors<ImportTestCaseFormValues> => {
      return {
        folderName: commonValidators.requiredField(folderName),
      };
    },
  })(ImportTestCaseModal),
);
