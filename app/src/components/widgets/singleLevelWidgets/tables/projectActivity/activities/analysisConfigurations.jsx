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

import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Link from 'redux-first-router-link';
import { FormattedMessage } from 'react-intl';
import { ANALYSIS } from 'common/constants/settingsTabs';
import { GENERATE_INDEX } from 'common/constants/actionTypes';
import { getProjectSettingTabPageLink } from './utils';
import styles from './common.scss';

const cx = classNames.bind(styles);

export const AnalysisConfigurations = ({ activity }) => (
  <Fragment>
    <span className={cx('user-name')}>{activity.user}</span>
    <FormattedMessage id="AnalysisConfigurations.update" defaultMessage="updated" />
    <Link
      to={getProjectSettingTabPageLink(activity.projectName, ANALYSIS)}
      className={cx('link')}
      target="_blank"
    >
      <FormattedMessage
        id="AnalysisConfigurations.analysisConfigurations"
        defaultMessage="Auto-Analysis configurations:"
      />
    </Link>
    {activity.actionType === GENERATE_INDEX ? (
      <FormattedMessage id="AnalysisConfigurations.generateIndex" defaultMessage="generate index" />
    ) : (
      <FormattedMessage id="AnalysisConfigurations.removeIndex" defaultMessage="remove index" />
    )}
  </Fragment>
);

AnalysisConfigurations.propTypes = {
  activity: PropTypes.object,
};
AnalysisConfigurations.defaultProps = {
  activity: {},
};
