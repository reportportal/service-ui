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
import classNames from 'classnames/bind';
import { injectIntl, defineMessages } from 'react-intl';
import Link from 'redux-first-router-link';
import { INTEGRATIONS } from 'common/constants/settingsTabs';
import {
  UPDATE_INTEGRATION,
  CREATE_INTEGRATION,
  DELETE_INTEGRATION,
} from 'common/constants/actionTypes';
import { getProjectSettingTabPageLink } from './utils';
import styles from './common.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  [CREATE_INTEGRATION]: {
    id: 'ExternalSystems.createIntegration',
    defaultMessage: 'configured',
  },
  [UPDATE_INTEGRATION]: {
    id: 'ExternalSystems.updateIntegration',
    defaultMessage: 'updated ',
  },
  [DELETE_INTEGRATION]: {
    id: 'ExternalSystems.deleteIntegration',
    defaultMessage: 'removed',
  },
  emailDefaultName: {
    id: 'ExternalSystems.emailDefaultName',
    defaultMessage: 'Email Server',
  },
  properties: {
    id: 'ExternalSystems.properties',
    defaultMessage: 'properties',
  },
  fromProject: {
    id: 'ExternalSystems.fromProject',
    defaultMessage: 'from project',
  },
});

@injectIntl
export class Integration extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    activity: PropTypes.object,
  };
  static defaultProps = {
    activity: {},
  };

  getIntegrationName = () => {
    const {
      activity,
      intl: { formatMessage },
    } = this.props;
    const name = activity.details.history.find((item) => item.field === 'name');
    const actualName =
      name.newValue ||
      name.oldValue ||
      (messages[`${activity.details.objectName}DefaultName`]
        ? formatMessage(messages[`${activity.details.objectName}DefaultName`])
        : '');

    return actualName.charAt(0).toUpperCase() + actualName.slice(1);
  };

  render() {
    const {
      activity,
      intl: { formatMessage },
    } = this.props;
    const linksParams = {
      target: '_blank',
      to: getProjectSettingTabPageLink(activity.projectName, INTEGRATIONS),
      className: cx('link'),
    };
    const integrationName = this.getIntegrationName();
    return (
      <Fragment>
        <span className={cx('user-name')}>{activity.user}</span>
        {`${messages[activity.actionType] && formatMessage(messages[activity.actionType])}`}
        {activity.actionType === UPDATE_INTEGRATION && (
          <Fragment>
            {integrationName}
            <Link {...linksParams}>{formatMessage(messages.properties)}.</Link>
          </Fragment>
        )}
        {activity.actionType === CREATE_INTEGRATION && (
          <Link {...linksParams}>{integrationName}.</Link>
        )}
        {activity.actionType === DELETE_INTEGRATION && (
          <Fragment>
            <Link {...linksParams}>{integrationName}</Link>
            {formatMessage(messages.fromProject)}.
          </Fragment>
        )}
      </Fragment>
    );
  }
}
