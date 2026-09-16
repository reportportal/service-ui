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

import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { ModalLayout } from 'components/main/modal';
import {
  marketplaceInstallErrorSelector,
  marketplaceInstallingPluginsSelector,
} from 'controllers/plugins';
import styles from './versionChangeModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  working: {
    id: 'VersionChangeModal.working',
    defaultMessage: 'Changing…',
  },
});

/**
 * The upgrade / downgrade confirmation, which outlives its own answer.
 *
 * <p>The shared confirmation dialog closes the moment it is confirmed, before the request it
 * started has said anything. That is right for something that cannot fail; a version change can,
 * and closing first leaves the admin looking at a page that has not changed, with nothing saying
 * whether it was about to. So this one stays open while the install runs and closes only when it
 * succeeds.
 *
 * <p>On failure it also stays, deliberately. The failure is reported on the page rather than in
 * here — the operation was about the plugin, not about the dialog — and leaving the dialog up is
 * what keeps the admin where they were rather than dropping them somewhere and explaining later.
 */
export const VersionChangeModal = ({ data }) => {
  const { formatMessage } = useIntl();
  const { registryId, title, message, confirmText, onConfirm } = data;
  const installing = useSelector(marketplaceInstallingPluginsSelector).includes(registryId);
  const installError = useSelector(marketplaceInstallErrorSelector);
  const [submitted, setSubmitted] = useState(false);
  // Whether the install was ever actually seen running. The saga puts the plugin into the in-flight
  // set a tick after the action is dispatched, so for that tick `installing` is still false and an
  // effect keyed on it alone would read "already finished" and close on the spot — the very thing
  // this dialog exists not to do.
  const [started, setStarted] = useState(false);
  // the close function ModalLayout hands the ok button, kept so the effect below can use it
  const closeRef = useRef(null);

  const failed = installError?.registryId === registryId;

  useEffect(() => {
    if (installing) {
      setStarted(true);
    }
  }, [installing]);

  useEffect(() => {
    // it ran, it stopped running, and nothing failed: it worked, so there is nothing left to
    // confirm or to explain
    if (submitted && started && !installing && !failed) {
      closeRef.current?.();
    }
  }, [submitted, started, installing, failed]);

  return (
    <ModalLayout
      title={title}
      okButton={{
        text: installing ? formatMessage(messages.working) : confirmText,
        danger: true,
        disabled: installing,
        onClick: (closeModal) => {
          closeRef.current = closeModal;
          setSubmitted(true);
          onConfirm();
        },
      }}
      cancelButton={{ text: data.cancelText }}
    >
      <p className={cx('message')} data-automation-id="versionChangeMessage">
        {Parser(message)}
      </p>
    </ModalLayout>
  );
};

VersionChangeModal.propTypes = {
  data: PropTypes.shape({
    /** The plugin being changed, which is how this dialog recognises its own install. */
    registryId: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
    confirmText: PropTypes.string.isRequired,
    cancelText: PropTypes.string.isRequired,
    onConfirm: PropTypes.func.isRequired,
  }).isRequired,
};

/**
 * The modal as an element on the action, the way this page's other dialogs are opened: the shared
 * modal registry keys on an id, and a marketplace dialog that only this page raises has no reason
 * to be in it.
 */
export const versionChangeModal = (data) => ({
  component: <VersionChangeModal data={data} />,
});
