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
import {
  CREATE_DASHBOARD,
  UPDATE_DASHBOARD,
  DELETE_DASHBOARD,
  CREATE_WIDGET,
  UPDATE_WIDGET,
  DELETE_WIDGET,
  CREATE_FILTER,
  UPDATE_FILTER,
  DELETE_FILTER,
  CREATE_PATTERN,
  UPDATE_PATTERN,
  DELETE_PATTERN,
  MATCHED_PATTERN,
} from 'common/constants/actionTypes';
import styles from './common.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  [CREATE_DASHBOARD]: {
    id: 'CommonEntityChanges.create',
    defaultMessage: 'created dashboard',
  },
  [UPDATE_DASHBOARD]: {
    id: 'CommonEntityChanges.updateDashboard',
    defaultMessage: 'updated dashboard',
  },
  [DELETE_DASHBOARD]: {
    id: 'CommonEntityChanges.deleteDashboard',
    defaultMessage: 'deleted dashboard',
  },
  [CREATE_WIDGET]: {
    id: 'CommonEntityChanges.createWidget',
    defaultMessage: 'created widget',
  },
  [UPDATE_WIDGET]: {
    id: 'CommonEntityChanges.updateWidget',
    defaultMessage: 'updated widget',
  },
  [DELETE_WIDGET]: {
    id: 'CommonEntityChanges.deleteWidget',
    defaultMessage: 'deleted widget',
  },
  [CREATE_FILTER]: {
    id: 'CommonEntityChanges.createFilter',
    defaultMessage: 'created filter',
  },
  [UPDATE_FILTER]: {
    id: 'CommonEntityChanges.updateFilter',
    defaultMessage: 'updated filter',
  },
  [DELETE_FILTER]: {
    id: 'CommonEntityChanges.deleteFilter',
    defaultMessage: 'deleted filter',
  },
  [CREATE_PATTERN]: {
    id: 'CommonEntityChanges.createPattern',
    defaultMessage: 'created pattern',
  },
  [UPDATE_PATTERN]: {
    id: 'CommonEntityChanges.updatePattern',
    defaultMessage: 'updated pattern',
  },
  [DELETE_PATTERN]: {
    id: 'CommonEntityChanges.deletePattern',
    defaultMessage: 'deleted pattern',
  },
  [MATCHED_PATTERN]: {
    id: 'CommonEntityChanges.matchedPattern',
    defaultMessage: 'matched pattern',
  },
});

@injectIntl
export class CommonEntity extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    activity: PropTypes.object,
  };
  static defaultProps = {
    activity: {},
  };
  state = {
    testItem: null,
  };

  render() {
    const { activity, intl } = this.props;
    return (
      <Fragment>
        <span className={cx('user-name')}>{activity.user}</span>
        {messages[activity.actionType] && intl.formatMessage(messages[activity.actionType])}
        <span className={cx('activity-name')}> {activity.details.objectName}.</span>
      </Fragment>
    );
  }
}
