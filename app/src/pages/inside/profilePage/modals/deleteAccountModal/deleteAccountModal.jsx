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
import { redirect } from 'redux-first-router';
import classNames from 'classnames/bind';
import { ModalLayout, withModal } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { logoutAction } from 'controllers/auth';
import { Input } from 'components/inputs/input';
import { LOGIN_PAGE_AFTER_REMOVE } from 'controllers/pages';
import styles from './deleteAccountModal.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  header: {
    id: 'DeleteAccountModal.header',
    defaultMessage: 'Delete account',
  },
  firstDescription: {
    id: 'DeleteAccountModal.firstDescription',
    defaultMessage:
      'The process is irrevocable. By clicking on the <b>"Delete"</b> button you agree to remove all <b>your personal information including your account name, email and photo</b> from our database.',
  },
  secondDescription: {
    id: 'DeleteAccountModal.secondDescription',
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

const DeleteAccount = ({ data }) => {
  // eslint-disable-next-line no-unused-vars
  const { options, otherValue } = data;
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [value, setValue] = useState('');

  const onChange = (e) => {
    const currentValue = e.target.value;
    setValue(currentValue);
    setIsConfirmed(currentValue === DELETE);
  };

  const onDelete = (closeModal) => {
    closeModal();
    // todo send 'options' and 'otherValue' to GA4
    // todo dispatch delete account action with delete request
    dispatch(logoutAction());
    dispatch(redirect({ type: LOGIN_PAGE_AFTER_REMOVE }));
  };

  const deleteButton = {
    text: formatMessage(COMMON_LOCALE_KEYS.DELETE),
    onClick: (closeModal) => {
      onDelete(closeModal);
    },
    danger: true,
    disabled: !isConfirmed,
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
      <div className={cx('description')}>{Parser(formatMessage(messages.firstDescription))}</div>
      <div className={cx('description')}>{Parser(formatMessage(messages.secondDescription))}</div>
      <div className={cx('description')}>{formatMessage(messages.question)}</div>
      <div className={cx('label')}>{Parser(formatMessage(messages.label))}</div>
      <div className={cx('input')}>
        <Input value={value} onChange={onChange} />
      </div>
    </ModalLayout>
  );
};
DeleteAccount.propTypes = {
  data: PropTypes.shape({
    options: PropTypes.object,
    otherValue: PropTypes.string,
  }),
};
DeleteAccount.defaultProps = {
  data: {},
};

export const DeleteAccountModal = withModal('deleteAccountModal')(DeleteAccount);
