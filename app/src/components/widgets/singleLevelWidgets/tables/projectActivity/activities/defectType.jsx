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
import { injectIntl, defineMessages } from 'react-intl';
import classNames from 'classnames/bind';
import Link from 'redux-first-router-link';
import { DEFECT } from 'common/constants/settingsTabs';
import { DELETE_DEFECT, UPDATE_DEFECT, CREATE_DEFECT } from 'common/constants/actionTypes';
import { getProjectKey, getProjectSettingTabPageLink } from './utils';
import styles from './common.scss';
import { activityItemDefaultProps, activityItemPropTypes } from './propTypes';

const cx = classNames.bind(styles);

const messages = defineMessages({
  [DELETE_DEFECT]: {
    id: 'DefectTypeChanges.delete',
    defaultMessage: 'deleted defect type',
  },
  [UPDATE_DEFECT]: {
    id: 'DefectTypeChanges.update',
    defaultMessage: 'updated defect type',
  },
  [CREATE_DEFECT]: {
    id: 'DefectTypeChanges.create',
    defaultMessage: 'created defect type',
  },
  defectTypes: {
    id: 'DefectTypeChanges.defectTypes',
    defaultMessage: 'defect types',
  },
});

@injectIntl
export class DefectType extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    ...activityItemPropTypes,
  };
  static defaultProps = activityItemDefaultProps;

  state = {
    testItem: null,
  };

  render() {
    const { activity, intl } = this.props;
    return (
      <Fragment>
        <span className={cx('user-name')}>{activity.user}</span>
        {messages[activity.actionType] && intl.formatMessage(messages[activity.actionType])}
        <Link
          to={getProjectSettingTabPageLink(
            getProjectKey(activity),
            DEFECT,
            activity.organizationSlug,
          )}
          className={cx('link')}
          target="_blank"
        >
          {activity.objectName || intl.formatMessage(messages.defectTypes)}
        </Link>
      </Fragment>
    );
  }
}
