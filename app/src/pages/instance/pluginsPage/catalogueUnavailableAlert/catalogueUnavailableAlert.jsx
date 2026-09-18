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
import styles from './catalogueUnavailableAlert.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  header: {
    id: 'CatalogueUnavailableAlert.header',
    defaultMessage: 'The plugin catalogue could not be loaded',
  },
  // deliberately not the offline copy: offline the installed list is still authoritative,
  // here the request itself failed and nothing about it is known
  body: {
    id: 'CatalogueUnavailableAlert.body',
    defaultMessage:
      'The request for the catalogue failed, so nothing from the registry is shown and the installed plugins listed below may be out of date. No advisory, block, removal or update has been checked, and none can be until the catalogue loads. Uploading a plugin .jar by hand still works.',
  },
  // The plugin page asks about one plugin, not about the catalogue: there is no list below it
  // to be out of date, and "the catalogue" is not what the reader was looking at.
  pluginHeader: {
    id: 'CatalogueUnavailableAlert.pluginHeader',
    defaultMessage: 'This plugin could not be read from the registry',
  },
  pluginBody: {
    id: 'CatalogueUnavailableAlert.pluginBody',
    defaultMessage:
      'The request failed, so nothing the registry knows about this plugin is shown here. No advisory, block, removal or update has been checked, and none can be until the request succeeds. The plugin itself keeps running, and uploading a .jar by hand still works.',
  },
  retry: {
    id: 'CatalogueUnavailableAlert.retry',
    defaultMessage: 'Try again',
  },
});

export const CatalogueUnavailableAlert = ({ onRetry = () => {}, scope = 'catalogue' }) => {
  const { formatMessage } = useIntl();
  const forPlugin = scope === 'plugin';

  return (
    <div
      className={cx('catalogue-unavailable-alert')}
      data-automation-id="catalogueUnavailableAlert"
      data-scope={scope}
    >
      <SystemMessage
        mode="error"
        header={formatMessage(forPlugin ? messages.pluginHeader : messages.header)}
      >
        {formatMessage(forPlugin ? messages.pluginBody : messages.body)}
        <div
          className={cx('catalogue-unavailable-alert-retry')}
          data-automation-id="retryCatalogue"
        >
          <Button variant="ghost" onClick={onRetry}>
            {formatMessage(messages.retry)}
          </Button>
        </div>
      </SystemMessage>
    </div>
  );
};

CatalogueUnavailableAlert.propTypes = {
  onRetry: PropTypes.func,
  /** Which request failed: the catalogue behind the list, or one plugin's own detail. */
  scope: PropTypes.oneOf(['catalogue', 'plugin']),
};
