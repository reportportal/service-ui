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
import { SystemMessage } from '@reportportal/ui-kit';
import { MARKETPLACE_INSTALL_ERROR } from 'controllers/plugins/constants';
import styles from './versionChangeAlert.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  header: {
    id: 'VersionChangeAlert.header',
    defaultMessage: 'The version was not changed',
  },
  blocked: {
    id: 'VersionChangeAlert.blocked',
    defaultMessage:
      'Nothing changed — {plugin} is still on {version}. The marketplace refuses to serve the'
      + ' version you picked, so it cannot be installed from here. Pick another version.',
  },
  removed: {
    id: 'VersionChangeAlert.removed',
    defaultMessage:
      'Nothing changed — {plugin} is still on {version}. The plugin has been removed from the'
      + ' marketplace, so no version of it can be installed from there any more. If you kept a'
      + ' .jar of the version you want, it can still be uploaded by hand.',
  },
  offline: {
    id: 'VersionChangeAlert.offline',
    defaultMessage:
      'Nothing changed — {plugin} is still on {version}. The marketplace could not be reached, and'
      + ' changing a version downloads the plugin again rather than switching to a copy held here.'
      + ' Try again once the connection is back.',
  },
  generic: {
    id: 'VersionChangeAlert.generic',
    defaultMessage: 'Nothing changed — {plugin} is still on {version}. {reason}',
  },
});

const REASON_BY_CODE = {
  [MARKETPLACE_INSTALL_ERROR.VERSION_BLOCKED]: messages.blocked,
  [MARKETPLACE_INSTALL_ERROR.PLUGIN_REMOVED]: messages.removed,
  [MARKETPLACE_INSTALL_ERROR.REGISTRY_UNREACHABLE]: messages.offline,
};

/**
 * What a failed version change says, on the page rather than in the dialog.
 *
 * <p>It belongs to the page because the operation did: the dialog asked a question, and the answer
 * is about the plugin. It also outlives the dialog, which a toast in the corner does not — an admin
 * who looked away while a download ran comes back to a page that still explains itself.
 *
 * <p>Every message opens by saying that nothing changed, and names the version still installed.
 * The install is atomic, so the first thing an admin needs is not what went wrong but whether they
 * are now somewhere unexpected. They are not, and the sentence says so before it says anything
 * else.
 *
 * <p>Two lines at most, with the whole message on the element, because the server's own prose can
 * run long and a page that grows a paragraph on failure pushes everything else out of view.
 */
export const VersionChangeAlert = ({ pluginName, installedVersion, errorCode, reason = null }) => {
  const { formatMessage } = useIntl();
  const descriptor = REASON_BY_CODE[errorCode] || messages.generic;
  const text = formatMessage(descriptor, {
    plugin: pluginName,
    version: installedVersion,
    // only the generic message quotes the server; the three named ones say it better themselves
    reason: reason || '',
  });

  return (
    <div
      className={cx('version-change-alert')}
      data-automation-id="versionChangeAlert"
      data-error-code={errorCode || undefined}
    >
      <SystemMessage mode="error" header={formatMessage(messages.header)}>
        <span className={cx('text')} title={text}>
          {text}
        </span>
      </SystemMessage>
    </div>
  );
};

VersionChangeAlert.propTypes = {
  pluginName: PropTypes.string.isRequired,
  /** The version still installed, which is the point of the sentence. */
  installedVersion: PropTypes.string.isRequired,
  /** service-api's `errorCode`; an unmapped one falls back to quoting the server. */
  errorCode: PropTypes.number,
  /** The server's own message, shown only when nothing more specific applies. */
  reason: PropTypes.string,
};
