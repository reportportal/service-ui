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

import { useTracking } from 'react-tracking';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useIntl, defineMessages } from 'react-intl';
import { ModalLayout, ModalField } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { InputDropdown } from 'components/inputs/inputDropdown';
import classNames from 'classnames/bind';
import { LAUNCHES_MODAL_EVENTS } from 'components/main/analytics/events';
import { downloadFile } from 'common/utils/downloadFile';
import { URLS } from 'common/urls';
import { addExportAction, removeExportAction } from 'controllers/exports';
import { showErrorNotification, showSuccessNotification } from 'controllers/notification';
import { ERROR_CANCELED } from 'common/utils';
import { useDispatch, useSelector } from 'react-redux';
import { activeProjectKeySelector } from 'controllers/user';
import { PDF_EXPORT, XLS_EXPORT, HTML_EXPORT } from './constants';
import styles from './launchExportModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  title: {
    id: 'LaunchExportModal.title',
    defaultMessage: 'Export report',
  },
  formatFieldLabel: {
    id: 'LaunchExportModal.formatFieldLabel',
    defaultMessage: 'Export file format',
  },
  description: {
    id: 'LaunchExportModal.description',
    defaultMessage:
      '<strong>Do not refresh the page</strong> while the report is being generated - you’ll see a progress banner at the top. Attachments, if included, will be saved in a structured archive but may slow down the process.',
  },
  includeAttachments: {
    id: 'LaunchExportModal.includeAttachments',
    defaultMessage: 'Include Attachments',
  },
  export: {
    id: 'LaunchExportModal.export',
    defaultMessage: 'Export',
  },
  startExport: {
    id: 'LaunchExportModal.startExport',
    defaultMessage: 'The export has been started successfully',
  },
  successExportLaunch: {
    id: 'LaunchExportModal.successExportLaunch',
    defaultMessage: '{exportType} export of launch "{launchName}" has been successfully completed',
  },
  failExportLaunch: {
    id: 'LaunchExportModal.failExportLaunch',
    defaultMessage: '{exportType} export of launch "{launchName}" has failed',
  },
});

export const LaunchExportModal = ({ id, name }) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const [exportType, setExportType] = useState(PDF_EXPORT);
  const [isWithAttachments, setIsWithAttachments] = useState(false);
  const dispatch = useDispatch();
  const projectKey = useSelector(activeProjectKeySelector);

  const exportOptions = [
    {
      value: PDF_EXPORT,
      label: PDF_EXPORT,
    },
    {
      value: XLS_EXPORT,
      label: XLS_EXPORT,
    },
    {
      value: HTML_EXPORT,
      label: HTML_EXPORT,
    },
  ];

  const onChangeExportType = (value) => {
    setExportType(value);
  };

  const toggleWithAttachments = () => {
    setIsWithAttachments((currentState) => !currentState);
  };

  const onExportLaunch = async () => {
    const requestId = `${id}_${Date.now()}`;
    const messageParams = {
      exportType,
      launchName: name,
    };

    try {
      await downloadFile(URLS.exportLaunch(projectKey, id, exportType), {
        params: { includeAttachments: isWithAttachments },
        abort: (cancelRequest) => dispatch(addExportAction({ id: requestId, cancelRequest })),
      });
      dispatch(
        showSuccessNotification({
          message: formatMessage(messages.successExportLaunch, messageParams),
        }),
      );
    } catch (e) {
      if (e.message !== ERROR_CANCELED) {
        dispatch(
          showErrorNotification({
            message: formatMessage(messages.failExportLaunch, messageParams),
          }),
        );
      }
    } finally {
      dispatch(removeExportAction(requestId));
    }
  };

  const exportAndClose = (closeModal) => {
    trackEvent(
      LAUNCHES_MODAL_EVENTS.getClickExportLaunchBtnModalEvent(exportType, isWithAttachments),
    );
    dispatch(
      showSuccessNotification({
        message: formatMessage(messages.startExport),
      }),
    );
    onExportLaunch();
    closeModal();
  };

  const okButton = {
    text: formatMessage(messages.export),
    onClick: exportAndClose,
  };
  const cancelButton = {
    text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
  };

  return (
    <ModalLayout
      title={formatMessage(messages.title)}
      okButton={okButton}
      cancelButton={cancelButton}
    >
      <ModalField label={formatMessage(messages.formatFieldLabel)} className={cx('modal-field')}>
        <InputDropdown
          customClasses={{ container: cx('export-type-field') }}
          options={exportOptions}
          value={exportType}
          onChange={onChangeExportType}
        />
        <InputCheckbox
          className={cx('include-attachments-field')}
          value={isWithAttachments}
          onChange={toggleWithAttachments}
        >
          {formatMessage(messages.includeAttachments)}
        </InputCheckbox>
      </ModalField>
      <p className={cx('description')}>
        {formatMessage(messages.description, {
          strong: (data) => <strong>{data}</strong>,
        })}
      </p>
    </ModalLayout>
  );
};
LaunchExportModal.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
};
