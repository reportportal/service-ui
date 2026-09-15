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
import styles from './registryOfflineAlert.scss';

const cx = classNames.bind(styles);

// The host stays out of the header. SystemMessage title-cases what it is given, which turns a
// hostname into a different hostname — "marketplace" rendered as "Marketplace" — and the whole
// point of naming it is that an operator can go and check that exact address.
const messages = defineMessages({
  header: {
    id: 'RegistryOfflineAlert.header',
    defaultMessage: 'The plugin registry could not be reached',
  },
  unknownHost: {
    id: 'RegistryOfflineAlert.unknownHost',
    defaultMessage: 'The configured registry address did not answer.',
  },
  knownHost: {
    id: 'RegistryOfflineAlert.knownHost',
    defaultMessage: '{host} did not answer.',
  },
  // The reviewed copy, plus the two things it does not say and this page needs. FR-A-04 requires
  // the all-clear caveat: nothing marketplace-derived is retained while the registry is
  // unreachable, so every row goes clean and a reader would otherwise take that for good news.
  // And the hand upload is the escape valve for exactly this situation, so it is worth naming
  // while the rest of the page is refusing to do anything.
  body: {
    id: 'RegistryOfflineAlert.body',
    defaultMessage:
      'Installed plugins keep running. Available plugins are not listed, and nothing can be installed, upgraded or downgraded until the connection returns. No advisory, block or removal can be checked either, so the absence of warnings below is not an all-clear. Uploading a plugin .jar by hand still works. Refresh the page to check again.',
  },
});

export const RegistryOfflineAlert = ({ host = null }) => {
  const { formatMessage } = useIntl();

  return (
    <div className={cx('registry-offline-alert')} data-automation-id="registryOfflineAlert">
      <SystemMessage mode="warning" header={formatMessage(messages.header)}>
        <span data-automation-id="registryOfflineHost">
          {host ? formatMessage(messages.knownHost, { host }) : formatMessage(messages.unknownHost)}
        </span>{' '}
        {formatMessage(messages.body)}
      </SystemMessage>
    </div>
  );
};

RegistryOfflineAlert.propTypes = {
  host: PropTypes.string,
};
