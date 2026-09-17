/*
 * Copyright 2026 EPAM Systems
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

import { useState } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { FieldText, FieldTextFlex, SystemMessage } from '@reportportal/ui-kit';
import { ModalLayout } from 'components/main/modal';
import styles from './addLicenceModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  title: {
    id: 'AddLicenceModal.title',
    defaultMessage: 'Add License',
  },
  add: {
    id: 'AddLicenceModal.add',
    defaultMessage: 'Add',
  },
  cancel: {
    id: 'AddLicenceModal.cancel',
    defaultMessage: 'Cancel',
  },
  customerId: {
    id: 'AddLicenceModal.customerId',
    defaultMessage: 'Customer ID',
  },
  customerIdHelp: {
    id: 'AddLicenceModal.customerIdHelp',
    defaultMessage:
      'Identifies your organization to the marketplace. Delivered together with the license key.',
  },
  licenceKey: {
    id: 'AddLicenceModal.licenceKey',
    defaultMessage: 'License key',
  },
  licenceKeyHelp: {
    id: 'AddLicenceModal.licenceKeyHelp',
    defaultMessage:
      'Stored encrypted and never shown again. Required only to install premium plugins — the rest' +
      ' of the marketplace works without it.',
  },
  // Said here and again on success, deliberately: the key is checked at install, not at save. This
  // sets the expectation before the admin commits; the alert repeats it at the moment they would
  // otherwise assume the job is finished. Without both, a bad key first shows up as a failed
  // install days later, somewhere else in the product.
  noticeTitle: {
    id: 'AddLicenceModal.noticeTitle',
    defaultMessage: 'How the license is used',
  },
  noticeBody: {
    id: 'AddLicenceModal.noticeBody',
    defaultMessage:
      'The key is stored on this instance and checked by the marketplace when you install or' +
      ' upgrade a premium plugin.',
  },
  requiredField: {
    id: 'Common.requiredFieldHint',
    defaultMessage: 'Field is required',
  },
  customerIdMissing: {
    id: 'AddLicenceModal.customerIdMissing',
    defaultMessage: 'Enter the customer ID that came with your license key.',
  },
  // Describes what the check actually catches — a truncated or mis-pasted value — and claims
  // nothing about validity, which this screen cannot judge. The string it replaced was written for
  // PKCS#8 PEM and asked for BEGIN/END lines that base64 does not have.
  keyMalformed: {
    id: 'AddLicenceModal.keyMalformed',
    defaultMessage:
      "That doesn't look like a complete license key. Paste the whole value delivered with your" +
      ' purchase.',
  },
  requestFailed: {
    id: 'AddLicenceModal.requestFailed',
    defaultMessage: 'The server did not accept the last request: {reason}',
  },
});

// base64: the alphabet, then `=` padding only at the end, and a length that is a multiple of four.
const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;

/**
 * Whether a trimmed key could be a base64 value at all.
 *
 * <p>Shape only, and deliberately no further. ADR-011 puts the real verdict at artifact download,
 * where the registry holds the entitlement — nothing here can decide whether a well-formed key is
 * a valid one. So this does not decode, does not measure the decoded length against an Ed25519
 * key, and does not verify anything: it catches a paste that was cut short or picked up stray
 * characters, which is the one failure the admin can still fix while looking at the field.
 */
export const isBase64Shaped = (value) => BASE64.test(value) && value.length % 4 === 0;

/**
 * Add License.
 *
 * <p>A dialog rather than a permanently open form, and the reason is what the field can and cannot
 * say: the stored key is masked and never returned, so an input sitting open on the settings page
 * is ambiguous — unset, or set and hidden? The input exists only during the moment it is genuinely
 * being filled, and a saved licence is a card instead.
 *
 * <p>Both values go together or neither does: the endpoint takes the pair, and a customer ID
 * without its key identifies nothing.
 */
export const AddLicenceModal = ({ data }) => {
  const { onSubmit, error = null } = data;
  const { formatMessage } = useIntl();

  const [customerId, setCustomerId] = useState('');
  const [licenceKey, setLicenceKey] = useState('');
  const [customerIdTouched, setCustomerIdTouched] = useState(false);
  const [licenceKeyTouched, setLicenceKeyTouched] = useState(false);

  // Trimmed before anything else. A key pasted out of a mail client or a terminal arrives with
  // stray spaces and newlines, and refusing a correct key over invisible whitespace is the worst
  // failure this dialog could produce.
  const trimmedCustomerId = customerId.trim();
  const trimmedKey = licenceKey.trim();

  const customerIdError = () => {
    if (!trimmedCustomerId) {
      return customerIdTouched
        ? formatMessage(messages.customerIdMissing)
        : formatMessage(messages.requiredField);
    }
    return undefined;
  };

  const licenceKeyError = () => {
    if (!trimmedKey) {
      return formatMessage(messages.requiredField);
    }
    if (!isBase64Shaped(trimmedKey)) {
      return formatMessage(messages.keyMalformed);
    }
    return undefined;
  };

  const canSubmit = !customerIdError() && !licenceKeyError();

  return (
    <ModalLayout
      title={formatMessage(messages.title)}
      okButton={{
        text: formatMessage(messages.add),
        disabled: !canSubmit,
        onClick: (closeModal) => {
          closeModal();
          onSubmit({ customerId: trimmedCustomerId, privateKey: trimmedKey });
        },
      }}
      cancelButton={{ text: formatMessage(messages.cancel) }}
    >
      <div className={cx('notice')} data-automation-id="licenceNotice">
        <SystemMessage mode="info" header={formatMessage(messages.noticeTitle)}>
          {formatMessage(messages.noticeBody)}
        </SystemMessage>
      </div>
      <div className={cx('field')}>
        <FieldText
          label={formatMessage(messages.customerId)}
          value={customerId}
          isRequired
          error={customerIdError()}
          touched={customerIdTouched}
          hasDoubleMessage
          helpText={formatMessage(messages.customerIdHelp)}
          data-automation-id="customerIdField"
          onBlur={() => setCustomerIdTouched(true)}
          onChange={(event) => setCustomerId(event.target.value)}
        />
      </div>
      <div className={cx('field')}>
        {/* Multi-line on purpose — the kit's flex field rather than the single-line one. base64
            does not require it, but delivered keys arrive wrapped, and a single-line input mangles
            a wrapped paste without saying so. */}
        {/* The flex field takes a narrower prop set than FieldText and spreads the rest onto the
            textarea, so `isRequired` and `hasDoubleMessage` are not passed: they would land in the
            DOM. Being required still reads — the error says so, and Add stays disabled. */}
        <FieldTextFlex
          label={formatMessage(messages.licenceKey)}
          value={licenceKey}
          error={licenceKeyError()}
          touched={licenceKeyTouched}
          helpText={formatMessage(messages.licenceKeyHelp)}
          className={cx('key-input')}
          data-automation-id="licenceKeyField"
          onBlur={() => setLicenceKeyTouched(true)}
          onChange={(event) => setLicenceKey(event.target.value)}
        />
      </div>
      {error && (
        <p className={cx('error')} data-automation-id="licenceError">
          {formatMessage(messages.requestFailed, { reason: error })}
        </p>
      )}
    </ModalLayout>
  );
};

AddLicenceModal.propTypes = {
  data: PropTypes.shape({
    onSubmit: PropTypes.func.isRequired,
    /** A rejection the server sent for a previous attempt, shown over the form. */
    error: PropTypes.string,
  }).isRequired,
};

/**
 * Raised as an element on the action rather than through the shared id registry, the way the
 * marketplace page's own dialogs are: a dialog only this section opens has no reason to be
 * findable by id from anywhere else.
 */
export const addLicenceModal = ({ onSubmit, error = null }) => ({
  component: <AddLicenceModal data={{ onSubmit, error }} />,
});
