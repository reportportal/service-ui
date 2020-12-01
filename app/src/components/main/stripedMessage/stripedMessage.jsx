/*
 * Copyright 2020 EPAM Systems
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
import styles from './stripedMessage.scss';

const INFO_TYPE = 'info';
const WARNING_TYPE = 'warning';

const cx = classNames.bind(styles);

export const StripedMessage = ({ image, header, type, children, style }) => (
  <div style={style} className={cx('striped-message', `type-${type}`)}>
    {image && <img src={image} alt={type} className={cx('image')} />}
    <div className={cx('message-content')}>
      {header && <h3 className={cx('header')}>{header}</h3>}
      <p className={cx('message')}>{children}</p>
    </div>
  </div>
);
StripedMessage.propTypes = {
  children: PropTypes.string.isRequired,
  type: PropTypes.oneOf([INFO_TYPE, WARNING_TYPE]),
  image: PropTypes.string,
  header: PropTypes.string,
  style: PropTypes.object,
};
StripedMessage.defaultProps = {
  type: INFO_TYPE,
  image: null,
  header: '',
  style: {},
};
