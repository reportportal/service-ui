/*
 * Copyright 2023 EPAM Systems
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

import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import { ModalLayout, withModal } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { logoutAction } from 'controllers/auth';
import { Input } from 'components/inputs/input';
import { ACCOUNT_REMOVED_PAGE } from 'controllers/pages';
import { deleteUserAccountAction } from 'controllers/user';
import styles from './deleteAccountModal.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  header: {
    id: 'DeleteAccountModal.header',
    defaultMessage: 'Delete account',
  },
  deleteAccountNote: {
    id: 'DeleteAccountModal.deleteAccountNote',
    defaultMessage:
      'The process is irrevocable. By clicking on the <b>"Delete"</b> button you agree to remove all <b>your personal information including your account name, email and photo</b> from our database.',
  },
  deletePersonalDataNote: {
    id: 'DeleteAccountModal.deletePersonalDataNote',
    defaultMessage:
      'All the data that you have created or reported to ReportPortal will remain in the app, but will no longer be available to you. This includes any <b>launches, filters, widgets, dashboards, etc</b>.',
  },
  question: {
    id: 'DeleteAccountModal.question',
    defaultMessage: 'Are you sure you want to delete your account?',
  },
  label: {
    id: 'DeleteAccountModal.label',
    defaultMessage: 'Type "<b>DELETE</b>" to confirm',
  },
});

const DELETE = 'DELETE';

// eslint-disable-next-line no-unused-vars
const DeleteAccount = ({ data }) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const [confirmationValue, setConfirmationValue] = useState('');

  const onChange = (e) => {
    const newValue = e.target.value;
    setConfirmationValue(newValue);
  };

  const onDelete = () => {
    const onSuccess = () => {
      // todo send 'data' to GA4
      dispatch(logoutAction(ACCOUNT_REMOVED_PAGE));
    };

    dispatch(deleteUserAccountAction(onSuccess));
  };

  const deleteButton = {
    text: formatMessage(COMMON_LOCALE_KEYS.DELETE),
    onClick: onDelete,
    danger: true,
    disabled: confirmationValue !== DELETE,
  };
  const cancelButton = {
    text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
  };

  return (
    <ModalLayout
      title={formatMessage(messages.header)}
      okButton={deleteButton}
      cancelButton={cancelButton}
    >
      <p className={cx('description')}>
        {formatMessage(messages.deleteAccountNote, {
          b: (message) => Parser(`<b>${message}</b>`),
        })}
      </p>
      <p className={cx('description')}>
        {formatMessage(messages.deletePersonalDataNote, {
          b: (message) => Parser(`<b>${message}</b>`),
        })}
      </p>
      <p className={cx('description')}>{formatMessage(messages.question)}</p>
      <p className={cx('label')}>
        {formatMessage(messages.label, {
          b: (message) => Parser(`<b>${message}</b>`),
        })}
      </p>
      <div className={cx('input')}>
        <Input value={confirmationValue} onChange={onChange} />
      </div>
    </ModalLayout>
  );
};
DeleteAccount.propTypes = {
  data: PropTypes.object,
};
DeleteAccount.defaultProps = {
  data: {},
};

export const DeleteAccountModal = withModal('deleteAccountModal')(DeleteAccount);
