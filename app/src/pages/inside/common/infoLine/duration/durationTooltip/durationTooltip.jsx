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

import classNames from 'classnames/bind';
import { FormattedMessage } from 'react-intl';
import styles from './durationTooltip.scss';

const cx = classNames.bind(styles);

export const DurationTooltip = () => (
  <div className={cx('duration-tooltip')}>
    <FormattedMessage
      id="DurationTooltip.message"
      defaultMessage="Duration is interval between first child starts and last child ends. But if child run in parallel, end time is a time of longest child, in this case duration will not be equal to child duration sum."
    />
  </div>
);
