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
import classNames from 'classnames/bind';
import { ModalLayout, withModal } from 'components/main/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { showModalAction } from 'controllers/modal';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { Input } from 'components/inputs/input';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import styles from './deleteAccountFeedbackModal.scss';

const cx = classNames.bind(styles);
const messages = defineMessages({
  header: {
    id: 'DeleteAccountFeedbackModal.header',
    defaultMessage: 'Delete account',
  },
  description: {
    id: 'DeleteAccountFeedbackModal.description',
    defaultMessage: 'Why are you deleting your account?',
  },
  continue: {
    id: 'DeleteAccountFeedbackModal.continue',
    defaultMessage: 'Continue',
  },
  NO_NEEDED: {
    id: 'DeleteAccountFeedbackModal.NO_NEEDED',
    defaultMessage: 'The account is no longer needed',
  },
  DISSATISFIED: {
    id: 'DeleteAccountFeedbackModal.DISSATISFIED',
    defaultMessage: 'Dissatisfied with the service',
  },
  ALTERNATIVE: {
    id: 'DeleteAccountFeedbackModal.ALTERNATIVE',
    defaultMessage: 'Found a better alternative',
  },
  OTHER: {
    id: 'DeleteAccountFeedbackModal.OTHER',
    defaultMessage: 'Other',
  },
  inputError: {
    id: 'DeleteAccountFeedbackModal.inputError',
    defaultMessage: 'The field should have size not more than 128 symbols.',
  },
});

const NO_NEEDED = 'NO_NEEDED';
const DISSATISFIED = 'DISSATISFIED';
const ALTERNATIVE = 'ALTERNATIVE';
const OTHER = 'OTHER';

const DeleteAccountFeedback = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const [options, setOptions] = useState({
    [NO_NEEDED]: false,
    [DISSATISFIED]: false,
    [ALTERNATIVE]: false,
    [OTHER]: false,
  });
  const [otherValue, setOtherValue] = useState('');
  const [error, setError] = useState('');

  const disabledContinueButton = () => {
    let isAnyOptionChecked = false;
    Object.keys(options).forEach((key) => {
      isAnyOptionChecked = isAnyOptionChecked || options[key];
    });
    return !isAnyOptionChecked || !!error;
  };

  const continueButton = {
    text: formatMessage(messages.continue),
    onClick: () => {
      dispatch(
        showModalAction({
          id: 'deleteAccountModal',
          data: {
            options,
            otherValue,
          },
        }),
      );
    },
    disabled: disabledContinueButton(),
  };
  const cancelButton = {
    text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
  };

  const onOtherValueChange = (e) => {
    const currentValue = e.target.value;
    setOtherValue(currentValue);
    setOptions((prevState) => ({ ...prevState, [OTHER]: !!currentValue }));
    setError(currentValue.length > 128 ? formatMessage(messages.inputError) : '');
  };

  const renderOptions = () =>
    Object.keys(options).map((key) => {
      const checked = options[key];
      const onChange = () => {
        setOptions((prevState) => ({ ...prevState, [key]: !checked }));
      };
      return (
        <li key={key} className={cx('option')}>
          <InputCheckbox value={checked} onChange={onChange}>
            <div className={cx('label')}>{formatMessage(messages[key])}</div>
          </InputCheckbox>
          {key === OTHER && (
            <div className={cx('input')}>
              <FieldErrorHint active={!!error} error={error}>
                <Input value={otherValue} onChange={onOtherValueChange} />
              </FieldErrorHint>
            </div>
          )}
        </li>
      );
    });

  return (
    <ModalLayout
      title={formatMessage(messages.header)}
      okButton={continueButton}
      cancelButton={cancelButton}
    >
      <div className={cx('description')}>{formatMessage(messages.description)}</div>
      <ul className={cx('options')}>{renderOptions()}</ul>
    </ModalLayout>
  );
};

export const DeleteAccountFeedbackModal = withModal('deleteAccountFeedbackModal')(
  DeleteAccountFeedback,
);
