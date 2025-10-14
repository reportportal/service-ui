import { useState, ChangeEvent, useMemo, useEffect } from 'react';
import { useIntl } from 'react-intl';
import Parser from 'html-react-parser';
import Link from 'redux-first-router-link';
import { isString } from 'es-toolkit';
import {
  FieldText,
  Modal,
  FileDropArea,
  AddCsvIcon,
  AttachedFile,
  MIME_TYPES,
} from '@reportportal/ui-kit';
import type { MimeType } from '@reportportal/ui-kit/dist/components/fileDropArea/types';

import { createClassnames } from 'common/utils';
import { commonMessages } from 'pages/inside/testCaseLibraryPage/commonMessages';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { useImportTestCase } from './useImportTestCase';
import ExternalLinkIcon from 'common/img/open-in-rounded-inline.svg';

import { messages } from './messages';

import styles from './importTestCaseModal.scss';

export const IMPORT_TEST_CASE_MODAL_KEY = 'importTestCaseModalKey';

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const MIME_PART = MIME_TYPES as unknown as {
  csv: MimeType;
  xls: MimeType;
  plain: MimeType;
};
const CSV_MIME_TYPES = [MIME_PART.csv, MIME_PART.xls, MIME_PART.plain] as const;

const cx = createClassnames(styles);

type FileLike = File | { file: File };
type FileInput = FileLike | FileLike[];

const extractFolderIdFromHash = (hash: string) => {
  const m = hash.match(/\/testLibrary\/folder\/(\d+)/i);
  return m ? Number(m[1]) : undefined;
};

const toMB = (bytes: number) => +(bytes / (1024 * 1024)).toFixed(2);

export const ImportTestCaseModal = () => {
  const { formatMessage } = useIntl();
  const [folderName, setFolderName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [folderIdFromUrl, setFolderIdFromUrl] = useState<number | undefined>(() =>
    extractFolderIdFromHash(window.location.hash),
  );
  const { isImportingTestCases, importTestCases } = useImportTestCase();

  useEffect(() => {
    const onHashChange = () => setFolderIdFromUrl(extractFolderIdFromHash(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleImport = () => {
    if (!file) return;
    if (folderIdFromUrl != null) {
      return importTestCases({ file, testFolderId: folderIdFromUrl });
    }
    return importTestCases({ file, testFolderName: folderName });
  };

  const handleFolderNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFolderName(event.target.value);
  };

  const acceptFileMimeTypes = useMemo<MimeType[]>(() => [...CSV_MIME_TYPES], []);

  const handleFilesAdded = (incoming: FileInput) => {
    const items = Array.isArray(incoming) ? incoming : [incoming];
    if (!items.length) return;

    const next = items[0] instanceof File ? items[0] : items[0].file;
    setFile(next);
  };

  const handleRemove = () => setFile(null);

  const handleDownload = () => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const okButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.IMPORT),
    onClick: handleImport,
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
            </div>
          </FileDropArea>
          {file && (
            <div className={cx('import-test-case-modal__files')}>
              <AttachedFile
                fileName={file.name}
                size={toMB(file.size)}
                isFullWidth
                onRemove={handleRemove}
                onDownload={handleDownload}
              />
            </div>
          )}
        </div>
        <div className={cx('import-test-case-modal__input-control')}>
          {folderIdFromUrl != null ? (
            <>
              <label className={cx('import-test-case-modal__label')}>
                {formatMessage(messages.importFolderNameLabel)}
              </label>
              <div className={cx('import-test-case-modal__static-value')}>
                <span>Accessibility compliance</span>
              </div>
            </>
          ) : (
            <FieldText
              label={formatMessage(messages.importFolderNameLabel)}
              defaultWidth={false}
              value={folderName}
              onChange={handleFolderNameChange}
              helpText={formatMessage(messages.importFolderNameDescription)}
              disabled={isImportingTestCases}
            />
          )}
        </div>
      </div>
    </Modal>
  );
};
