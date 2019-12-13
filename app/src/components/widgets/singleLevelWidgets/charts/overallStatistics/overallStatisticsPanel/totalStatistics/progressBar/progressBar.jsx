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
import styles from './progressBar.scss';

const cx = classNames.bind(styles);

export class ProgressBar extends React.PureComponent {
  static propTypes = {
    progressData: PropTypes.object.isRequired,
  };

  static getPercentage = (value, totalVal) => `${value / totalVal * 100}%`;

  render() {
    const { total, passed, failed, skipped } = this.props.progressData;
    const { getPercentage } = ProgressBar;

    return (
      <div className={cx('container')}>
        <div style={{ width: getPercentage(passed, total) }} className={cx('passed')} />
        <div style={{ width: getPercentage(failed, total) }} className={cx('failed')} />
        <div style={{ width: getPercentage(skipped, total) }} className={cx('skipped')} />
      </div>
    );
  }
}
