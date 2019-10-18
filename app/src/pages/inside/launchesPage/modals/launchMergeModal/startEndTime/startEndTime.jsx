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

import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { dateFormat } from 'common/utils';
import { Input } from 'components/inputs/input';
import styles from './startEndTime.scss';

const cx = classNames.bind(styles);

export const StartEndTime = ({ start, end }) => (
  <div className={cx('start-end-time')}>
    <Input value={dateFormat(start)} disabled />
    <div className={cx('separator')}>/</div>
    <Input value={dateFormat(end)} disabled />
  </div>
);

StartEndTime.propTypes = {
  start: PropTypes.number.isRequired,
  end: PropTypes.number.isRequired,
};
