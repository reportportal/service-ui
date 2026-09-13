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

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import classNames from 'classnames/bind';
import Parser from 'html-react-parser';
import { ModalLayout } from 'components/main/modal';
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
 * <p>Compatibility is NOT represented here. The registry publishes a per-version range and
 * service-api applies it, but neither the range nor the running ReportPortal release reaches this
 * client, so the dialog cannot mark a version as incompatible without inventing the verdict. When
 * the catalogue contract carries it, this is where it goes.
 */
export const InstallPluginModal = ({ data }) => {
  const { pluginName, versions, defaultVersion, onInstall } = data;
  const { formatMessage } = useIntl();
  const installable = versions.filter(({ blocked }) => !blocked).map(({ version }) => version);
  // the row that opened this dialog wins; otherwise the newest installable one
  const [version, setVersion] = useState(
    installable.includes(defaultVersion) ? defaultVersion : installable[0],
  );

  return (
    <ModalLayout
      title={formatMessage(messages.title)}
      okButton={{
        text: formatMessage(messages.install),
        disabled: !version,
        onClick: (closeModal) => {
          closeModal();
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
        <InputDropdown
          value={version}
          options={installable.map((value) => ({ value, label: value }))}
          onChange={setVersion}
        />
      </div>
    </ModalLayout>
  );
};

InstallPluginModal.propTypes = {
  data: PropTypes.shape({
    pluginName: PropTypes.string.isRequired,
    /** The registry's version list for this plugin, newest first, `blocked` among each entry. */
    versions: PropTypes.arrayOf(
      PropTypes.shape({ version: PropTypes.string.isRequired, blocked: PropTypes.bool }),
    ).isRequired,
    /** Preselected when it is installable — the version whose row opened this dialog. */
    defaultVersion: PropTypes.string,
    onInstall: PropTypes.func.isRequired,
  }).isRequired,
};

/**
 * Opened the way the premium promo is: as an element on the action rather than through the id
 * registry, which needs the module to be imported somewhere unrelated before it can be found.
 */
export const installPluginModal = ({ pluginName, versions, defaultVersion = null, onInstall }) => ({
  component: <InstallPluginModal data={{ pluginName, versions, defaultVersion, onInstall }} />,
});
