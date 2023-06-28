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

import React from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import { reduxForm } from 'redux-form';
import classNames from 'classnames/bind';
import { ModalLayout, withModal } from 'components/main/modal';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldProvider } from 'components/fields';
import { Input } from 'components/inputs/input';
import { InputCheckbox } from 'components/inputs/inputCheckbox';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { bindMessageToValidator } from 'common/utils/validation';
import { showModalAction } from 'controllers/modal';
import {
  deleteAccountFeedbackAnyCheckboxIsChecked,
  deleteAccountFeedbackOtherValue,
} from 'common/utils/validation/validate';
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
});

const NO_NEEDED = 'NO_NEEDED';
const DISSATISFIED = 'DISSATISFIED';
const ALTERNATIVE = 'ALTERNATIVE';
const OTHER = 'OTHER';
const OTHER_VALUE = 'OTHER_VALUE';

const DeleteAccountFeedback = ({ invalid, handleSubmit }) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  const continueButton = {
    text: formatMessage(messages.continue),
    onClick: () => {
      handleSubmit((data) => {
        dispatch(
          showModalAction({
            id: 'deleteAccountModal',
            data: { data },
          }),
        );
      })();
    },
    disabled: invalid,
    attributes: { type: 'submit' },
  };
  const cancelButton = {
    text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
  };

  return (
    <ModalLayout
      title={formatMessage(messages.header)}
      okButton={continueButton}
      cancelButton={cancelButton}
    >
      <div className={cx('description')}>{formatMessage(messages.description)}</div>
      <form>
        <ul className={cx('options')}>
          {[NO_NEEDED, DISSATISFIED, ALTERNATIVE, OTHER].map((variant) => (
            <li key={variant} className={cx('option')}>
              <div className={cx('input')}>
                <FieldProvider name={variant} format={Boolean}>
                  <InputCheckbox>
                    <div className={cx('label')}>{formatMessage(messages[variant])}</div>
                  </InputCheckbox>
                </FieldProvider>
              </div>
              {variant === OTHER && (
                <div className={cx('input')}>
                  <FieldProvider name={OTHER_VALUE}>
                    <FieldErrorHint>
                      <Input />
                    </FieldErrorHint>
                  </FieldProvider>
                </div>
              )}
            </li>
          ))}
        </ul>
      </form>
    </ModalLayout>
  );
};
DeleteAccountFeedback.propTypes = {
  invalid: PropTypes.bool.isRequired,
  handleSubmit: PropTypes.func.isRequired,
};

export const DeleteAccountFeedbackModal = withModal('deleteAccountFeedbackModal')(
  reduxForm({
    form: 'deleteAccountFeedbackForm',
    validate: ({ OTHER_VALUE: value, ...checkBoxes }) => ({
      [OTHER_VALUE]: bindMessageToValidator(
        deleteAccountFeedbackOtherValue,
        'textMore128Hint',
      )(value),
      [NO_NEEDED]: deleteAccountFeedbackAnyCheckboxIsChecked(checkBoxes),
    }),
    onChange: (data, dispatch, { change }) => {
      dispatch(change(OTHER, data[OTHER] || !!data[OTHER_VALUE]));
    },
  })(DeleteAccountFeedback),
);
