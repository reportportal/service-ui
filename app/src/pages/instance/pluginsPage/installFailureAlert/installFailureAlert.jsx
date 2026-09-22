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
import styles from './installFailureAlert.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  header: {
    id: 'InstallFailureAlert.header',
    defaultMessage: 'The plugin was not installed',
  },
  // D-06. An install that half-succeeds is the frightening reading, and it is the one to close off
  // before naming a cause. The install is atomic, so this is true of every case below and every
  // message opens on it.
  generic: {
    id: 'InstallFailureAlert.generic',
    defaultMessage:
      'Nothing was installed and this instance is unchanged. The download or install step failed' +
      ' for a reason this page cannot name — the server log for this request has it.',
  },
  // ADR-011: the instance never validates the key, the registry does, and only at artifact
  // download. So this is the first and only place a bad licence can surface, and the remedy is
  // always somewhere else. No "keeps running": nothing is installed to keep running.
  licence: {
    id: 'InstallFailureAlert.licence',
    defaultMessage:
      'Nothing was installed. {plugin} is a premium plugin and the marketplace rejected this' +
      ' instance’s licence. The customer ID and licence key are in Server Settings → Marketplace.',
  },
  // FR-OP-03. The operator's own words, verbatim: this is a failure page the admin opened
  // deliberately, not a list tooltip, so D-05's rule against unbounded operator text does not
  // apply here.
  blocked: {
    id: 'InstallFailureAlert.blocked',
    defaultMessage:
      'Nothing was installed. The marketplace refuses to serve version {version}: {reason} Pick' +
      ' another version, or upload a .jar of this one by hand if you kept one.',
  },
  // Temporary by nature, so it ends on when to try again rather than on a workaround. The address
  // is deliberately unnamed — ADR-004 lets an enterprise point the instance anywhere, so a literal
  // host helps exactly nobody who would see this.
  unreachable: {
    id: 'InstallFailureAlert.unreachable',
    defaultMessage:
      'Nothing was installed. The marketplace could not be reached. Plugins already installed keep' +
      ' running; nothing new can be installed until the connection returns. Try again once it is' +
      ' back.',
  },
  blockedNoReason: {
    id: 'InstallFailureAlert.blockedNoReason',
    defaultMessage:
      'Nothing was installed. The marketplace refuses to serve version {version}. Pick another' +
      ' version, or upload a .jar of this one by hand if you kept one.',
  },
});

/**
 * What a failed *first* install says, on the page rather than in the dialog that asked for it.
 *
 * <p>The sibling of `VersionChangeAlert`, and deliberately not the same component. That one opens
 * every sentence with the version still installed, because after a failed version change the
 * question an admin has is which build they are on. Here there is no such version: the plugin was
 * never installed, so the frames drop the clause entirely — the `License Invalid` spec says so
 * outright, because "keeps running" describes something that does not exist yet.
 *
 * <p>Four cases, keyed on service-api's `errorCode`. Anything else falls to the generic one, which
 * points at the log rather than inventing a cause — if a failure deserves its own words it gets its
 * own code and stops arriving here.
 */
export const InstallFailureAlert = ({
  pluginName,
  version = null,
  errorCode = null,
  reason = null,
}) => {
  const { formatMessage } = useIntl();

  const descriptor = () => {
    switch (errorCode) {
      case MARKETPLACE_INSTALL_ERROR.LICENCE_REJECTED:
        return messages.licence;
      case MARKETPLACE_INSTALL_ERROR.VERSION_BLOCKED:
        return reason ? messages.blocked : messages.blockedNoReason;
      case MARKETPLACE_INSTALL_ERROR.REGISTRY_UNREACHABLE:
        return messages.unreachable;
      default:
        return messages.generic;
    }
  };

  const text = formatMessage(descriptor(), {
    plugin: pluginName,
    version: version || '',
    // only the blocked case quotes the operator, and it ends the sentence, so it carries its own
    // stop rather than relying on whoever wrote the reason to have supplied one
    reason: reason ? `${reason.replace(/\.$/, '')}.` : '',
  });

  return (
    <div
      className={cx('install-failure-alert')}
      data-automation-id="installFailureAlert"
      data-error-code={errorCode || undefined}
    >
      <SystemMessage mode="error" header={formatMessage(messages.header)}>
        {/* two lines at most, with the whole message on the element: the generic case can carry
            server prose of any length, and a page that grows a paragraph on failure pushes the
            retry out of view */}
        <span className={cx('text')} title={text}>
          {text}
        </span>
      </SystemMessage>
    </div>
  );
};

InstallFailureAlert.propTypes = {
  pluginName: PropTypes.string.isRequired,
  /** The version that was refused, named only by the blocked case. */
  version: PropTypes.string,
  /** service-api's `errorCode`; an unmapped one falls to the generic message. */
  errorCode: PropTypes.number,
  /** The operator's stated reason, quoted verbatim by the blocked case and nowhere else. */
  reason: PropTypes.string,
};
