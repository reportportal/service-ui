/*
 * Copyright 2019 EPAM Systems
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

import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import classNames from 'classnames/bind';
import {
  NOTIFICATION_GROUP_TYPE,
  AUTHORIZATION_GROUP_TYPE,
  BTS_GROUP_TYPE,
  OTHER_GROUP_TYPE,
} from 'common/constants/pluginsGroupTypes';
import { IntegrationsListItem } from './integrationsListItem';
import styles from './integrationsList.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  [BTS_GROUP_TYPE]: {
    id: 'IntegrationsList.bts',
    defaultMessage: 'Bug Tracking Systems',
  },
  [NOTIFICATION_GROUP_TYPE]: {
    id: 'IntegrationsList.notification',
    defaultMessage: 'Notifications',
  },
  [AUTHORIZATION_GROUP_TYPE]: {
    id: 'IntegrationsList.authorization',
    defaultMessage: 'Authorization',
  },
  [OTHER_GROUP_TYPE]: {
    id: 'IntegrationsList.other',
    defaultMessage: 'Third party',
  },
});

@injectIntl
export class IntegrationsList extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    availableIntegrations: PropTypes.object.isRequired,
    onItemClick: PropTypes.func,
  };

  static defaultProps = {
    onItemClick: () => {},
  };

  render() {
    const {
      intl: { formatMessage },
      onItemClick,
      availableIntegrations,
    } = this.props;

    return (
      <div className={cx('integrations-list')}>
        {Object.keys(availableIntegrations).map((key) => (
          <div key={key} className={cx('integrations-group')}>
            <div className={cx('integrations-group-header')}>
              {messages[key] ? formatMessage(messages[key]) : key}
              {` (${availableIntegrations[key].length})`}
            </div>
            <div className={cx('integrations-group-items')}>
              {availableIntegrations[key].map((item) => (
                <Fragment key={item.name}>
                  <IntegrationsListItem onClick={onItemClick} integrationType={item} />
                </Fragment>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }
}
