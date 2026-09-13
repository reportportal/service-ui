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
import classNames from 'classnames/bind';
import { defineMessages, useIntl } from 'react-intl';
import { Button, FieldText } from '@reportportal/ui-kit';
import { SectionLayout } from 'pages/instance/serverSettingsPage/common';
import styles from './marketplaceLicence.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  header: {
    id: 'MarketplaceLicence.header',
    defaultMessage: 'Marketplace',
  },
  description: {
    id: 'MarketplaceLicence.description',
    defaultMessage:
      'Credentials the registry issued with your entitlement. They let this instance install premium plugins.',
  },
  customerId: {
    id: 'MarketplaceLicence.customerId',
    defaultMessage: 'Customer ID',
  },
  licenceKey: {
    id: 'MarketplaceLicence.licenceKey',
    defaultMessage: 'Licence key',
  },
  // the key is write-only: there is no endpoint that returns it, so the form never pretends to
  // be showing one
  configured: {
    id: 'MarketplaceLicence.configured',
    defaultMessage: 'Credentials are configured for customer {customerId}.',
  },
  // PUT takes both halves or neither, so a stored key cannot stand in for a typed one
  keyNotShown: {
    id: 'MarketplaceLicence.keyNotShown',
    defaultMessage:
      'The stored key is never shown again and cannot be reused from here. Paste the key again — the same one or a replacement — to save any change, including a change of customer ID.',
  },
  notConfigured: {
    id: 'MarketplaceLicence.notConfigured',
    defaultMessage: 'No credentials are configured, so premium plugins stay locked.',
  },
  submit: {
    id: 'MarketplaceLicence.submit',
    defaultMessage: 'Save credentials',
  },
  remove: {
    id: 'MarketplaceLicence.remove',
    defaultMessage: 'Remove credentials',
  },
  removeConsequence: {
    id: 'MarketplaceLicence.removeConsequence',
    defaultMessage:
      'Removing the credentials locks every premium plugin again and a premium install is refused as not configured. Plugins already installed keep running.',
  },
  confirmRemove: {
    id: 'MarketplaceLicence.confirmRemove',
    defaultMessage: 'Remove them',
  },
  cancel: {
    id: 'MarketplaceLicence.cancel',
    defaultMessage: 'Cancel',
  },
  // the id the rest of the app already uses for this, so the section reads the same as every
  // other required field rather than inventing its own wording
  requiredField: {
    id: 'Common.requiredFieldHint',
    defaultMessage: 'Field is required',
  },
  // the same slice carries a failed GET, PUT and DELETE alike, so the lead-in claims no more
  // than that the last request was not accepted
  requestFailed: {
    id: 'MarketplaceLicence.requestFailed',
    defaultMessage: 'The server did not accept the last request: {reason}',
  },
  saved: {
    id: 'MarketplaceLicence.saved',
    defaultMessage:
      'Credentials saved. Premium plugins can be installed now — the credentials are checked the first time you install one.',
  },
});

/**
 * The instance's marketplace credentials.
 *
 * The key lives in component state for exactly as long as it takes to submit it and is dropped
 * the moment the request is handed off; nothing here reads a key back from the store, because
 * nothing ever puts one there.
 *
 * Admin-only, matching PUT/GET/DELETE /v1/plugins/licence — for anyone else the section is not
 * rendered at all rather than shown disabled.
 */
export const MarketplaceLicence = ({
  isAdmin,
  configured = false,
  customerId = null,
  loading = false,
  error = null,
  onSubmit = () => {},
  onRemove = () => {},
}) => {
  const { formatMessage } = useIntl();
  const [customerIdValue, setCustomerIdValue] = useState(customerId || '');
  const [privateKey, setPrivateKey] = useState('');
  const [customerIdTouched, setCustomerIdTouched] = useState(false);
  const [privateKeyTouched, setPrivateKeyTouched] = useState(false);
  const [confirmingRemoval, setConfirmingRemoval] = useState(false);
  const [lastCustomerId, setLastCustomerId] = useState(customerId);
  const [saveInFlight, setSaveInFlight] = useState(false);
  // the slice's error is shared with the GET made on mount, so the banner waits for a request
  // this operator actually sent
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [wasLoading, setWasLoading] = useState(loading);
  const [saved, setSaved] = useState(false);

  // the GET is dispatched by the parent's effect, so the stored id always lands after mount; the
  // field takes it whenever it changes, and leaves what is being typed alone in between
  if (customerId !== lastCustomerId) {
    setLastCustomerId(customerId);
    setCustomerIdValue(customerId || '');
  }

  // loading dropping back is the request answering; the store writes the answer in the same
  // action, so an error and a stored licence cannot both be claimed for one save
  if (loading !== wasLoading) {
    setWasLoading(loading);
    if (!loading && saveInFlight) {
      setSaveInFlight(false);
      setHasSubmitted(true);
      setSaved(!error && configured);
    }
  }

  if (!isAdmin) {
    return null;
  }

  const trimmedCustomerId = customerIdValue.trim();
  const trimmedPrivateKey = privateKey.trim();
  // both halves are @NotBlank there, so a half-filled form — or one holding nothing but the
  // whitespace a paste dragged in — is refused here rather than sent and refused as a 400
  const canSubmit = Boolean(trimmedCustomerId) && Boolean(trimmedPrivateKey);
  const requiredHint = formatMessage(messages.requiredField);

  const handleSubmit = () => {
    setSaved(false);
    setSaveInFlight(true);
    onSubmit({ customerId: trimmedCustomerId, privateKey: trimmedPrivateKey });
    // the key does not outlive the request that carries it
    setPrivateKey('');
    setPrivateKeyTouched(false);
  };

  const handleRemove = () => {
    setConfirmingRemoval(false);
    setPrivateKey('');
    setSaved(false);
    onRemove();
  };

  return (
    <SectionLayout header={formatMessage(messages.header)}>
      <div className={cx('marketplace-licence')} data-automation-id="marketplaceLicence">
        <p className={cx('description')}>{formatMessage(messages.description)}</p>
        <p className={cx('status')} data-automation-id="licenceStatus">
          {configured
            ? formatMessage(messages.configured, { customerId: customerId || '' })
            : formatMessage(messages.notConfigured)}
        </p>
        {/* both halves are required: the label carries the asterisk and, once a field has been
            visited and left empty, the kit paints the reason the save button is dead */}
        <div className={cx('field')}>
          <FieldText
            label={formatMessage(messages.customerId)}
            value={customerIdValue}
            isRequired
            error={trimmedCustomerId ? undefined : requiredHint}
            touched={customerIdTouched}
            data-automation-id="customerIdField"
            onBlur={() => setCustomerIdTouched(true)}
            onChange={(event) => {
              setCustomerIdValue(event.target.value);
              setSaved(false);
            }}
          />
        </div>
        <div className={cx('field')}>
          {/* the field's own help slot rather than a paragraph beside it: the kit already
              places and styles this text, and a hand-rolled one drifts from every other form */}
          <FieldText
            type="password"
            label={formatMessage(messages.licenceKey)}
            value={privateKey}
            isRequired
            error={trimmedPrivateKey ? undefined : requiredHint}
            touched={privateKeyTouched}
            // the stored-key note is the field's standing help, so it stays beside the error
            // rather than being replaced by it
            hasDoubleMessage
            data-automation-id="licenceKeyField"
            helpText={configured ? formatMessage(messages.keyNotShown) : undefined}
            classNameHelpText={cx('licence-key-hint')}
            onBlur={() => setPrivateKeyTouched(true)}
            onChange={(event) => {
              setPrivateKey(event.target.value);
              setSaved(false);
            }}
          />
        </div>
        {/* a rejection the server sent back, told apart from the two required hints by sitting
            over the form rather than under a field. Only after the operator sent something: the
            slice also holds a failed GET from mount, and "the server did not accept the last
            request" over untouched fields blames them for a read they never made. */}
        {error && hasSubmitted && (
          <p className={cx('error')} data-automation-id="licenceError">
            {formatMessage(messages.requestFailed, { reason: error })}
          </p>
        )}
        {saved && (
          <p className={cx('saved')} data-automation-id="licenceSaved">
            {formatMessage(messages.saved)}
          </p>
        )}
        <div className={cx('actions')}>
          <Button
            variant="primary"
            disabled={loading || !canSubmit}
            data-automation-id="submitLicence"
            onClick={handleSubmit}
          >
            {formatMessage(messages.submit)}
          </Button>
          {configured && !confirmingRemoval && (
            <Button
              variant="ghost"
              disabled={loading}
              data-automation-id="removeLicence"
              onClick={() => setConfirmingRemoval(true)}
            >
              {formatMessage(messages.remove)}
            </Button>
          )}
        </div>
        {/* the consequence is stated before it happens, not reported after it */}
        {confirmingRemoval && (
          <div className={cx('confirm')} data-automation-id="removeLicenceConfirm">
            <p className={cx('confirm-body')}>{formatMessage(messages.removeConsequence)}</p>
            <div className={cx('actions')}>
              <Button
                variant="danger"
                data-automation-id="confirmRemoveLicence"
                onClick={handleRemove}
              >
                {formatMessage(messages.confirmRemove)}
              </Button>
              <Button
                variant="ghost"
                data-automation-id="cancelRemoveLicence"
                onClick={() => setConfirmingRemoval(false)}
              >
                {formatMessage(messages.cancel)}
              </Button>
            </div>
          </div>
        )}
      </div>
    </SectionLayout>
  );
};

MarketplaceLicence.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  configured: PropTypes.bool,
  customerId: PropTypes.string,
  loading: PropTypes.bool,
  error: PropTypes.string,
  onSubmit: PropTypes.func,
  onRemove: PropTypes.func,
};
