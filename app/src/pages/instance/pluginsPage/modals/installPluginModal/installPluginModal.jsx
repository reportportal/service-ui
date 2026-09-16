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

import React, { useEffect, useRef, useState } from 'react';
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
// the app's own dropdown rather than the kit's: the kit builds on downshift and cannot mount
// outside a browser, so a component holding it could not be tested at all
import { InputDropdown } from 'components/inputs/inputDropdown';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import styles from './installPluginModal.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  title: {
    id: 'InstallPluginModal.title',
    defaultMessage: 'Install Plugin',
  },
  description: {
    id: 'PluginItem.installConfirmation',
    defaultMessage:
      '<b>{pluginName}</b> will be downloaded from the marketplace and installed on this instance.',
  },
  versionLabel: {
    id: 'InstallPluginModal.versionLabel',
    defaultMessage: 'Version',
  },
  install: {
    id: 'PluginItem.install',
    defaultMessage: 'Install',
  },
  installing: {
    id: 'PluginItem.installingState',
    defaultMessage: 'Installing…',
  },
  // the two facts the frame states together: what the version wants, and what this instance is
  incompatibleWithRange: {
    id: 'InstallPluginModal.incompatibleWithRange',
    defaultMessage: 'Needs ReportPortal {requires}. This instance runs {productVersion}.',
  },
  incompatibleUnknownRelease: {
    id: 'InstallPluginModal.incompatibleUnknownRelease',
    defaultMessage: "This version doesn't run on the release this instance uses.",
  },
});

/**
 * The dialog the design puts between wanting a plugin and downloading one. It names the version,
 * because an install is not reversible by re-clicking: the instance runs whichever build this
 * posts, and the newest is only the default rather than the only answer.
 *
 * <p>A blocked version is left out of the list rather than offered and refused. The registry
 * already says which ones are blocked, and the versions table beside this dialog marks them;
 * putting one in a picker would only trade a visible rule for a server error.
 *
 * <p>A version that does not run here is shown and disabled, not hidden: the frame keeps it in the
 * list so the newest build is visibly present and visibly unavailable, which is the question the
 * user came with. The tooltip states both halves — what the version wants and what this instance
 * is — because either alone leaves them nowhere to go.
 *
 * <p>The verdict is service-api's, never recomputed here, and only an explicit `false` disables a
 * row. The range beside it is quoted, not parsed.
 *
 * <p>It also outlives its own answer, for the reason `VersionChangeModal` does: all four
 * `Install. Failed.*` frames are drawn with this dialog still open behind the alert. Closing on
 * confirm leaves an admin looking at a page that has not changed, with nothing saying whether it
 * was about to — and on failure it keeps them where they were instead of dropping them somewhere
 * and explaining afterwards. The failure itself is reported on the page: the operation was about
 * the plugin, not about the dialog.
 */
export const InstallPluginModal = ({ data }) => {
  const { pluginName, registryId, versions, defaultVersion, productVersion, onInstall } = data;
  const { formatMessage } = useIntl();

  // Only an explicit refusal closes a row. service-api serialises with NON_NULL, so an undecided
  // verdict and an older service-api that sends no verdict at all arrive identically as absent —
  // and disabling on absence would leave such an instance unable to install anything. Absent means
  // this side has no opinion; the server still refuses on install, and says why.
  const whyUnavailable = (entry) => {
    if (entry.compatible !== false) {
      return null;
    }

    return entry.requires && productVersion
      ? formatMessage(messages.incompatibleWithRange, {
          requires: entry.requires,
          productVersion,
        })
      : formatMessage(messages.incompatibleUnknownRelease);
  };

  // blocked versions are not in the list at all — the registry refuses them outright, and offering
  // one would trade a stated rule for a server error. An incompatible one stays, disabled.
  const options = versions
    .filter(({ blocked }) => !blocked)
    .map((entry) => {
      const unavailable = whyUnavailable(entry);

      return {
        value: entry.version,
        label: entry.version,
        disabled: Boolean(unavailable),
        title: unavailable || undefined,
      };
    });
  const installable = options.filter(({ disabled }) => !disabled).map(({ value }) => value);
  // the row that opened this dialog wins; otherwise the newest version that can actually be
  // installed, which is not always the newest one
  const [version, setVersion] = useState(
    installable.includes(defaultVersion) ? defaultVersion : installable[0],
  );

  // Without a registryId this dialog cannot recognise its own install, so it keeps the old
  // behaviour and closes on confirm. That is the catalogue's plain-confirmation path, which has no
  // failure frame of its own.
  const installing = useSelector(marketplaceInstallingPluginsSelector).includes(registryId);
  const installError = useSelector(marketplaceInstallErrorSelector);
  const [submitted, setSubmitted] = useState(false);
  // Whether the install was ever seen running. The saga adds the plugin to the in-flight set a tick
  // after the action is dispatched, so for that tick `installing` is still false and an effect
  // keyed on it alone reads "already finished" and closes on the spot.
  const [started, setStarted] = useState(false);
  const closeRef = useRef(null);

  const failed = Boolean(registryId) && installError?.registryId === registryId;
  const waits = Boolean(registryId);

  useEffect(() => {
    if (installing) {
      setStarted(true);
    }
  }, [installing]);

  useEffect(() => {
    // it ran, it stopped running, and nothing failed: there is nothing left to confirm or explain
    if (waits && submitted && started && !installing && !failed) {
      closeRef.current?.();
    }
  }, [waits, submitted, started, installing, failed]);

  return (
    <ModalLayout
      title={formatMessage(messages.title)}
      okButton={{
        text: formatMessage(installing ? messages.installing : messages.install),
        disabled: !version || installing,
        onClick: (closeModal) => {
          if (!waits) {
            closeModal();
            onInstall(version);
            return;
          }

          closeRef.current = closeModal;
          setSubmitted(true);
          onInstall(version);
        },
      }}
      cancelButton={{ text: formatMessage(COMMON_LOCALE_KEYS.CANCEL) }}
    >
      <p className={cx('description')} data-automation-id="installPluginDescription">
        {Parser(formatMessage(messages.description, { pluginName }))}
      </p>
      {/* the kit's Dropdown is not a native control, so this labels the field rather than
          binding to one */}
      <span className={cx('version-label')}>{formatMessage(messages.versionLabel)}</span>
      <div className={cx('version-field')} data-automation-id="installPluginVersion">
        <InputDropdown value={version} options={options} onChange={setVersion} />
      </div>
    </ModalLayout>
  );
};

InstallPluginModal.propTypes = {
  data: PropTypes.shape({
    pluginName: PropTypes.string.isRequired,
    /** The plugin being installed, which is how this dialog recognises its own install. Absent on
     * the catalogue's plain path, where the dialog closes on confirm as it always did. */
    registryId: PropTypes.string,
    /** The registry's version list for this plugin, newest first, `blocked` among each entry. */
    versions: PropTypes.arrayOf(
      PropTypes.shape({
        version: PropTypes.string.isRequired,
        blocked: PropTypes.bool,
        /** service-api's verdict: true, false, or null when it could not be decided. */
        compatible: PropTypes.bool,
        /** The range the version declares, for quoting in the reason. */
        requires: PropTypes.string,
      }),
    ).isRequired,
    /** Preselected when it is installable — the version whose row opened this dialog. */
    defaultVersion: PropTypes.string,
    /** The release this instance reports, or null when it does not know. Quoted, never parsed. */
    productVersion: PropTypes.string,
    onInstall: PropTypes.func.isRequired,
  }).isRequired,
};

/**
 * Opened the way the premium promo is: as an element on the action rather than through the id
 * registry, which needs the module to be imported somewhere unrelated before it can be found.
 */
export const installPluginModal = ({
  pluginName,
  registryId = null,
  versions,
  defaultVersion = null,
  productVersion = null,
  onInstall,
}) => ({
  component: (
    <InstallPluginModal
      data={{ pluginName, registryId, versions, defaultVersion, productVersion, onInstall }}
    />
  ),
});
