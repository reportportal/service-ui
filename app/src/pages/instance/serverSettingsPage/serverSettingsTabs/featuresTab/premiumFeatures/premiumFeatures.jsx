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

import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import { Button, SystemMessage } from '@reportportal/ui-kit';
import BinIcon from 'common/img/newIcons/bin-inline.svg';
import ExternalLinkIcon from 'common/img/open-in-rounded-inline.svg';
import Parser from 'html-react-parser';
import { referenceDictionary } from 'common/utils/referenceDictionary';
import { SectionLayout } from 'pages/instance/serverSettingsPage/common';
import { addLicenceModal } from './addLicenceModal';
import styles from './premiumFeatures.scss';

const cx = classNames.bind(styles);

// The dictionary's own entry, which is the bare address Help & Service versions → Contact us
// already uses — not `rpEmailRequestSupport`, which prefills a subject this action was told not to
// carry. Taken from there rather than written out again so the address lives in one place.
//
// Deliberately NOT the `Contact Us` footer link from Links & Branding: that one points wherever
// the customer's own admin set it, and this is ReportPortal's own support address, the same on
// every instance — which is what makes a fixed value right here.
const SUPPORT_MAILTO = referenceDictionary.rpEmail;

const messages = defineMessages({
  header: {
    id: 'PremiumFeatures.header',
    defaultMessage: 'Premium Features',
  },
  emptyState: {
    id: 'PremiumFeatures.emptyState',
    defaultMessage:
      'Premium plugins need a license to install. Add the customer ID and license key delivered' +
      ' with your purchase.',
  },
  addLicence: {
    id: 'PremiumFeatures.addLicence',
    defaultMessage: 'Add License',
  },
  customerId: {
    id: 'PremiumFeatures.customerId',
    defaultMessage: 'Customer ID',
  },
  licenceKey: {
    id: 'PremiumFeatures.licenceKey',
    defaultMessage: 'License key',
  },
  requestRenewal: {
    id: 'PremiumFeatures.requestRenewal',
    defaultMessage: 'Request License Renewal',
  },
  // Says the same thing the dialog's notice said — that the key is checked at install rather than
  // at save — at the moment the admin would otherwise assume the job is finished. One string, not
  // a heading plus sub-text: it is transient, and anything that must be read belongs on the page.
  saved: {
    id: 'PremiumFeatures.saved',
    defaultMessage:
      'License has been successfully added. You can now install premium plugins — the license is' +
      ' checked the first time you do.',
  },
  removeTitle: {
    id: 'PremiumFeatures.removeTitle',
    defaultMessage: 'Delete License',
  },
  // Opens on what survives, then what stops. The middle sentence is the rotation gap made visible:
  // the card deletes rather than edits, so replacing a key is delete-then-add, and between the two
  // the instance holds no licence. A premium install attempted in that window fails, and this is
  // the only place that is said.
  removeConsequence: {
    id: 'PremiumFeatures.removeConsequence',
    defaultMessage:
      "The customer ID and license key will be removed from this instance. The key isn't shown" +
      ' again after saving, so make sure you still have your copy. Nothing premium can be' +
      ' installed or upgraded until a license is added.',
  },
  confirmRemove: {
    id: 'PremiumFeatures.confirmRemove',
    defaultMessage: 'Delete',
  },
  cancel: {
    id: 'PremiumFeatures.cancel',
    defaultMessage: 'Cancel',
  },
  deleteHint: {
    id: 'PremiumFeatures.deleteHint',
    defaultMessage: 'Delete license',
  },
  requestFailed: {
    id: 'PremiumFeatures.requestFailed',
    defaultMessage: 'The server did not accept the last request: {reason}',
  },
  // The stored key is never returned by any endpoint, so the card shows that it is held rather
  // than pretending to show it.
  keyMasked: {
    id: 'PremiumFeatures.keyMasked',
    defaultMessage: '••••••••••••',
  },
});

/**
 * The instance's marketplace licence, on the tab that carries the instance's other capabilities.
 *
 * <p>Three states and no fourth: nothing configured, the dialog, and the saved card. There is no
 * edit — a card offering one would imply the key can be read back, and it cannot; replacing a
 * licence is delete then add. There is also no expiry state, and there cannot be: ADR-011 verifies
 * entitlement at artifact download and nowhere else, so this instance never learns that a licence
 * lapsed.
 *
 * <p>Admin-only, matching PUT/GET/DELETE /v1/plugins/licence — for anyone else the section is not
 * rendered at all rather than shown disabled.
 */
export const PremiumFeatures = ({
  isAdmin,
  configured = false,
  customerId = null,
  loading = false,
  error = null,
  saved = false,
  onSubmit = () => {},
  onRemove = () => {},
  showModal = () => {},
}) => {
  const { formatMessage } = useIntl();

  if (!isAdmin) {
    return null;
  }

  const openAddLicence = () => showModal(addLicenceModal({ onSubmit, error }));

  /**
   * The app's own confirmation dialog rather than a panel of this section's own. Nothing here is
   * recoverable — the key is write-only and cannot be read back — so it belongs in the same dialog
   * every other irreversible action in the product uses, with the danger button.
   */
  const confirmRemoval = () =>
    showModal({
      id: 'confirmationModal',
      data: {
        title: formatMessage(messages.removeTitle),
        message: formatMessage(messages.removeConsequence),
        confirmText: formatMessage(messages.confirmRemove),
        cancelText: formatMessage(messages.cancel),
        dangerConfirm: true,
        onConfirm: onRemove,
      },
    });

  return (
    <SectionLayout header={formatMessage(messages.header)}>
      <div className={cx('premium-features')} data-automation-id="premiumFeatures">
        {configured ? (
          <>
            {/* Two columns and a delete control. No edit, deliberately — see the class comment. */}
            <div className={cx('licence-card')} data-automation-id="licenceCard">
              <div className={cx('column')}>
                <span className={cx('label')}>{formatMessage(messages.customerId)}</span>
                <span className={cx('value')} data-automation-id="licenceCustomerId">
                  {customerId || ''}
                </span>
              </div>
              <div className={cx('column')}>
                <span className={cx('label')}>{formatMessage(messages.licenceKey)}</span>
                <span className={cx('value', 'masked')}>{formatMessage(messages.keyMasked)}</span>
              </div>
              <button
                type="button"
                className={cx('delete')}
                disabled={loading}
                title={formatMessage(messages.deleteHint)}
                aria-label={formatMessage(messages.deleteHint)}
                data-automation-id="removeLicence"
                onClick={confirmRemoval}
              >
                {Parser(BinIcon)}
              </button>
            </div>
            {/* Only where a licence exists: there is nothing to renew before there is a key, and
                that state offers Add License instead. */}
            <div className={cx('renewal')}>
              <a
                className={cx('renewal-link')}
                href={SUPPORT_MAILTO}
                data-automation-id="requestLicenceRenewal"
              >
                <span>{formatMessage(messages.requestRenewal)}</span>
                {Parser(ExternalLinkIcon)}
              </a>
            </div>
          </>
        ) : (
          <div className={cx('empty-state')} data-automation-id="licenceEmptyState">
            <p className={cx('empty-message')}>{formatMessage(messages.emptyState)}</p>
            <Button
              variant="ghost"
              disabled={loading}
              data-automation-id="addLicence"
              onClick={openAddLicence}
            >
              {formatMessage(messages.addLicence)}
            </Button>
          </div>
        )}
        {saved && (
          <div className={cx('saved')} data-automation-id="licenceSaved">
            <SystemMessage mode="success">{formatMessage(messages.saved)}</SystemMessage>
          </div>
        )}
        {/* A rejection of a delete, which has no dialog of its own to show it in. A failed save is
            reported inside the dialog that attempted it. */}
        {error && configured && (
          <p className={cx('error')} data-automation-id="licenceError">
            {formatMessage(messages.requestFailed, { reason: error })}
          </p>
        )}
      </div>
    </SectionLayout>
  );
};

PremiumFeatures.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  configured: PropTypes.bool,
  customerId: PropTypes.string,
  loading: PropTypes.bool,
  error: PropTypes.string,
  /** Whether the last request stored a licence, which is what the success alert reports. */
  saved: PropTypes.bool,
  onSubmit: PropTypes.func,
  onRemove: PropTypes.func,
  /** Raises the app's dialogs. A prop rather than a dispatch of its own, so this stays a component
   * that renders what it is given. */
  showModal: PropTypes.func,
};
