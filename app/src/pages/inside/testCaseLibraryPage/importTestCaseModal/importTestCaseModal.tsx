import { useState, ChangeEvent } from 'react';
import { FieldText, Modal, FileDropArea, AddCsvIcon } from '@reportportal/ui-kit';
import { commonMessages } from 'pages/inside/testCaseLibraryPage/commonMessages';
import { useIntl } from 'react-intl';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import classNames from 'classnames/bind';
import { messages } from './messages';

import Link from 'redux-first-router-link';
import ExternalLinkIcon from 'common/img/open-in-rounded-inline.svg';
import Parser from 'html-react-parser';
import styles from './importTestCaseModal.scss';

export const IMPORT_TEST_CASE_MODAL_KEY = 'importTestCaseModalKey';

export const ImportTestCaseModal = () => {
  const { formatMessage } = useIntl();
  const [folderName, setFolderName] = useState('');

  const handleFolderNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFolderName(event.target.value);
  };

  const okButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.IMPORT),
  };

  const cancelButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
  };

  const cx = classNames.bind(styles) as typeof classNames;

  const iconMarkup = typeof ExternalLinkIcon === 'string' ? Parser(ExternalLinkIcon) : null;

  return (
    <Modal
      title={formatMessage(commonMessages.importTestCaseModal)}
      okButton={okButton}
      cancelButton={cancelButton}
      className={cx('import-test-case-modal')}
    >
      <div className={cx('import-test-case-modal__content')}>
        <section className={cx('import-test-case-modal__info-block')}>
          <p className={cx('import-test-case-modal__info-text')}>
            {formatMessage(messages.downloadDescription)}
          </p>
          <Link href="#" className={cx('import-test-case-modal__download-link')}>
            {formatMessage(messages.downloadTemplate)}
            <i className={cx('import-test-case-modal__external-icon')}>{iconMarkup}</i>
          </Link>
        </section>

        <div>
          <FileDropArea
            messages={{
              incorrectFileFormat: 'File format is not supported',
              incorrectFileSize: 'File size exceeds the limit',
            }}
            onFilesAdded={() => {}}
            acceptFileMimeTypes={[]}
            maxFileSize={50}
          >
            <div className={cx('import-test-case-modal__drop-wrap')}>
              <FileDropArea.DropZone
                className={cx('import-test-case-modal__drop-zone')}
                icon={<AddCsvIcon />}
                description={
                  <>
                    Drop .CSV file or
                    <FileDropArea.BrowseButton>Browse</FileDropArea.BrowseButton> to attach
                  </>
                }
                fileSizeMessage="File size should be up to 50 MB"
              />
              <FileDropArea.Error />
            </div>
          </FileDropArea>
        </div>

        <div className={cx('import-test-case-modal__input-control')}>
          <FieldText
            label={formatMessage(messages.importFolderNameLabel)}
            defaultWidth={false}
            value={folderName}
            onChange={handleFolderNameChange}
            helpText={formatMessage(messages.importFolderNameDescription)}
          />
        </div>
      </div>
    </Modal>
  );
};
