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
  anyOptionSelected,
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
  noNeeded: {
    id: 'DeleteAccountFeedbackModal.noNeeded',
    defaultMessage: 'The account is no longer needed',
  },
  dissatisfied: {
    id: 'DeleteAccountFeedbackModal.dissatisfied',
    defaultMessage: 'Dissatisfied with the service',
  },
  alternative: {
    id: 'DeleteAccountFeedbackModal.alternative',
    defaultMessage: 'Found a better alternative',
  },
  other: {
    id: 'DeleteAccountFeedbackModal.other',
    defaultMessage: 'Other',
  },
});

const NO_NEEDED = 'noNeeded';
const DISSATISFIED = 'dissatisfied';
const ALTERNATIVE = 'alternative';
const OTHER = 'other';
const OTHER_REASON = 'otherReason';

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
      <p className={cx('description')}>{formatMessage(messages.description)}</p>
      <form>
        <ul className={cx('options')}>
          {[NO_NEEDED, DISSATISFIED, ALTERNATIVE, OTHER].map((variant) => (
            <li key={variant} className={cx('option')}>
              <div className={cx('input')}>
                <FieldProvider name={variant} format={Boolean}>
                  <InputCheckbox className={cx('checkbox')}>
                    <span className={cx('label')}>{formatMessage(messages[variant])}</span>
                  </InputCheckbox>
                </FieldProvider>
              </div>
              {variant === OTHER && (
                <div className={cx('input')}>
                  <FieldProvider name={OTHER_REASON}>
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
    validate: ({ otherReason, ...options }) => ({
      [OTHER_REASON]: bindMessageToValidator(
        deleteAccountFeedbackOtherValue,
        'deleteAccountReasonSizeHint',
      )(otherReason),
      [NO_NEEDED]: !anyOptionSelected(options),
    }),
    onChange: (formValues, dispatch, { change }) => {
      const isOtherOptionReasonExists = !!formValues[OTHER_REASON];
      if (!formValues[OTHER] && isOtherOptionReasonExists) {
        dispatch(change(OTHER, isOtherOptionReasonExists));
      }
    },
  })(DeleteAccountFeedback),
);
