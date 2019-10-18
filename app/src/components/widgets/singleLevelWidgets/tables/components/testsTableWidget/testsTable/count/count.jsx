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

import * as React from 'react';
import { number } from 'prop-types';
import { FormattedMessage } from 'react-intl';
import classNames from 'classnames/bind';
import styles from './count.scss';

const cx = classNames.bind(styles);

export const Count = ({ count, total }) => (
  <div className={cx('count')}>
    {count} <FormattedMessage id="Common.of" defaultMessage="of" /> {total}
  </div>
);

Count.propTypes = {
  count: number.isRequired,
  total: number.isRequired,
};
