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

import { Fragment } from 'react';
import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { AbsRelTime } from 'components/main/absRelTime';

import styles from './lastLogin.scss';

const cx = classNames.bind(styles);

export const LastLogin = ({ time }) => (
  <Fragment>
    <span className={cx('mobile-title', 'mobile-show')}>
      <FormattedMessage id={'LastLogin.mobileTitle'} defaultMessage={'Last login:'} />
    </span>
    <AbsRelTime startTime={time} />
  </Fragment>
);

LastLogin.propTypes = {
  time: PropTypes.number,
};
LastLogin.defaultProps = {
  time: 0,
};
