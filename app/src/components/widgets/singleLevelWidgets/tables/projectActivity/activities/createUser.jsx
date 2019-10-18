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

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import styles from './common.scss';

const cx = classNames.bind(styles);

export const CreateUser = ({ activity }) => (
  <div className={cx('create-user', 'clearfix')}>
    <span className={cx('new-user-name')}>{activity.details.objectName}, </span>
    <FormattedMessage id="CreateUser.welcome" defaultMessage="welcome to Report Portal!" />
  </div>
);
CreateUser.propTypes = {
  activity: PropTypes.object,
};
CreateUser.defaultProps = {
  activity: {},
};
