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
  onSubmit = () => {},
  onRemove = () => {},
}) => {
  const { formatMessage } = useIntl();
  const [customerIdValue, setCustomerIdValue] = useState(customerId || '');
  const [privateKey, setPrivateKey] = useState('');
  const [confirmingRemoval, setConfirmingRemoval] = useState(false);
  const [lastCustomerId, setLastCustomerId] = useState(customerId);

  // the GET is dispatched by the parent's effect, so the stored id always lands after mount; the
  // field takes it whenever it changes, and leaves what is being typed alone in between
  if (customerId !== lastCustomerId) {
    setLastCustomerId(customerId);
    setCustomerIdValue(customerId || '');
  }

  if (!isAdmin) {
    return null;
  }

  const trimmedCustomerId = customerIdValue.trim();
  const trimmedPrivateKey = privateKey.trim();
  // both halves are @NotBlank there, so a half-filled form — or one holding nothing but the
  // whitespace a paste dragged in — is refused here rather than sent and refused as a 400
  const canSubmit = Boolean(trimmedCustomerId) && Boolean(trimmedPrivateKey);

  const handleSubmit = () => {
    onSubmit({ customerId: trimmedCustomerId, privateKey: trimmedPrivateKey });
    // the key does not outlive the request that carries it
    setPrivateKey('');
  };

  const handleRemove = () => {
    setConfirmingRemoval(false);
    setPrivateKey('');
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
        <div className={cx('field')}>
          <FieldText
            label={formatMessage(messages.customerId)}
            value={customerIdValue}
            data-automation-id="customerIdField"
            onChange={(event) => setCustomerIdValue(event.target.value)}
          />
        </div>
        <div className={cx('field')}>
          {/* the field's own help slot rather than a paragraph beside it: the kit already
              places and styles this text, and a hand-rolled one drifts from every other form */}
          <FieldText
            type="password"
            label={formatMessage(messages.licenceKey)}
            value={privateKey}
            data-automation-id="licenceKeyField"
            helpText={configured ? formatMessage(messages.keyNotShown) : undefined}
            classNameHelpText={cx('licence-key-hint')}
            onChange={(event) => setPrivateKey(event.target.value)}
          />
        </div>
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
  onSubmit: PropTypes.func,
  onRemove: PropTypes.func,
};
