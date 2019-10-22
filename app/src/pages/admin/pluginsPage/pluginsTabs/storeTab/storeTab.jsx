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
import styles from './storeTab.scss';

const cx = classNames.bind(styles);

export const StoreTab = () => (
  <div className={cx('plugins-wrapper')}>
    <div className={cx('plugins-content-wrapper')}>
      <div className={cx('plugins-content')}>
        <h2 className={cx('plugins-content-title')}>Plugins Store</h2>
        <h3 className={cx('plugins-content-message')}>Waiting for implementation</h3>
      </div>
    </div>
  </div>
);
