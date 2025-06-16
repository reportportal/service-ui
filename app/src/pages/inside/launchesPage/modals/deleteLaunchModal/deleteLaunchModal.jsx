/*
 * Copyright 2024 EPAM Systems
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

import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import { defineMessages, useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import DOMPurify from 'dompurify';
import { withModal, ModalLayout } from 'components/main/modal';
import { LAUNCHES_MODAL_EVENTS } from 'components/main/analytics/events';
import { RETENTION_POLICY } from 'common/constants/retentionPolicy';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { Footer } from './footer';
import styles from './deleteLaunchModal.scss';

const messages = defineMessages({
  deleteModalHeader: {
    id: 'DeleteLaunchModal.deleteModalHeader',
    defaultMessage: 'Delete launch',
  },
  deleteModalMultipleHeader: {
    id: 'DeleteLaunchModal.deleteModalMultipleHeader',
    defaultMessage: 'Delete launches',
  },
  deleteModalContent: {
    id: 'DeleteLaunchModal.deleteModalContent',
    defaultMessage:
      "Are you sure you want to delete launch <b>''{name}''</b>? It will no longer exist.",
  },
  deleteModalMultipleContent: {
    id: 'DeleteLaunchModal.deleteModalMultipleContent',
    defaultMessage: 'Are you sure you want to delete launches? They will no longer exist.',
  },
  warning: {
    id: 'DeleteLaunchModal.warning',
    defaultMessage:
      'You are going to delete not your own launch. This may affect other users information on the project.',
  },
  warningMultiple: {
    id: 'DeleteLaunchModal.warningMultiple',
    defaultMessage:
      'You are going to delete not your own launches. This may affect other users information on the project.',
  },
  deleteWithImportantLaunchMessage: {
    id: 'DeleteLaunchModal.deleteWithImportantLaunchMessage',
    defaultMessage:
      '<b>There is "{name}" launch marked as important.</b><br />Are you sure you want to delete these important launches also?',
  },
  deleteWithImportantLaunchesMessage: {
    id: 'DeleteLaunchModal.deleteWithImportantLaunchesMessage',
    defaultMessage:
      'There are <b>{importantCount} launches marked as important</b> among the {totalCount} launches you are trying to delete. Are you sure you want to delete these important launches also?',
  },
  deleteImportantLaunchMessage: {
    id: 'DeleteLaunchModal.deleteImportantLaunchMessage',
    defaultMessage:
      '<b>”{name}” is marked as important.</b><br />Are you sure you want to delete this important launch?',
  },
  deleteImportantLaunchesMessage: {
    id: 'DeleteLaunchModal.deleteImportantLaunchesMessage',
    defaultMessage:
      '<b>There are {importantCount} launches marked as important.</b><br />Are you sure you want to delete these important launches?',
  },
});

const cx = classNames.bind(styles);

function DeleteLaunchModal({ data: { launches, confirmDeleteLaunches, userId } }) {
  const { formatMessage } = useIntl();
  const confirmAndClose = (closeModal) => {
    confirmDeleteLaunches(launches);
    closeModal();
  };

  const selectedImportantLaunches = launches.filter(
    (launch) => launch.retentionPolicy === RETENTION_POLICY.IMPORTANT,
  );

  const selectedRegularLaunches = launches.filter(
    (launch) => launch.retentionPolicy === RETENTION_POLICY.REGULAR,
  );

  const okButton = {
    text: formatMessage(COMMON_LOCALE_KEYS.DELETE),
    danger: true,
    onClick: confirmAndClose,
    eventInfo: LAUNCHES_MODAL_EVENTS.getClickDeleteLaunchesBtnModalEvent(
      selectedRegularLaunches.length > 1,
    ),
  };
  const cancelButton = {
    text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
  };

  const CustomFooter = useCallback(
    (props) => (
      <Footer
        {...props}
        launches={launches}
        selectedRegularLaunches={selectedRegularLaunches}
        selectedImportantLaunches={selectedImportantLaunches}
        confirmDeleteLaunches={confirmDeleteLaunches}
      />
    ),
    [launches, selectedRegularLaunches, selectedImportantLaunches, confirmDeleteLaunches],
  );

  const getMainContent = () => {
    if (selectedImportantLaunches.length > 0 && selectedRegularLaunches.length > 0) {
      return selectedImportantLaunches.length === 1
        ? formatMessage(messages.deleteWithImportantLaunchMessage, {
            b: (data) => DOMPurify.sanitize(`<b>${data}</b>`),
            name: selectedImportantLaunches[0].name,
          })
        : formatMessage(messages.deleteWithImportantLaunchesMessage, {
            b: (data) => DOMPurify.sanitize(`<b>${data}</b>`),
            importantCount: selectedImportantLaunches.length,
            totalCount: launches.length,
          });
    }
    if (selectedImportantLaunches.length > 0) {
      return selectedImportantLaunches.length === 1
        ? formatMessage(messages.deleteImportantLaunchMessage, {
            b: (data) => DOMPurify.sanitize(`<b>${data}</b>`),
            name: selectedImportantLaunches[0].name,
          })
        : formatMessage(messages.deleteImportantLaunchesMessage, {
            b: (data) => DOMPurify.sanitize(`<b>${data}</b>`),
            importantCount: selectedImportantLaunches.length,
          });
    }
    return launches.length === 1
      ? formatMessage(messages.deleteModalContent, {
          b: (data) => DOMPurify.sanitize(`<b>${data}</b>`),
          name: launches[0].name,
        })
      : formatMessage(messages.deleteModalMultipleContent);
  };

  const isNotAllOwnLaunches = launches.some((launch) => launch.owner !== userId);

  const warning =
    isNotAllOwnLaunches &&
    (launches.length === 1
      ? formatMessage(messages.warning)
      : formatMessage(messages.warningMultiple));

  return (
    <ModalLayout
      title={
        launches.length === 1
          ? formatMessage(messages.deleteModalHeader)
          : formatMessage(messages.deleteModalMultipleHeader)
      }
      okButton={okButton}
      cancelButton={cancelButton}
      warningMessage={warning}
      CustomFooter={selectedImportantLaunches.length > 0 ? CustomFooter : null}
      contentClassName={cx('delete-launch-modal-content')}
    >
      <p className={cx('message')}>{Parser(DOMPurify.sanitize(getMainContent()))}</p>
    </ModalLayout>
  );
}
DeleteLaunchModal.propTypes = {
  data: PropTypes.shape({
    launches: PropTypes.array.isRequired,
    confirmDeleteLaunches: PropTypes.func.isRequired,
    userId: PropTypes.string.isRequired,
  }),
};
export default withModal('deleteLaunchModal')(DeleteLaunchModal);
