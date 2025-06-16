/*
 * Copyright 2021 EPAM Systems
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
import Parser from 'html-react-parser';
import styles from './modalNote.scss';

const cx = classNames.bind(styles);

export function ModalNote({ icon, message, status }) {
  return (
    <div className={cx('modal-note', { [`status-${status}`]: status })}>
      <div className={cx('icon', { [`status-${status}`]: status })}>{Parser(icon)}</div>
      <span>{message}</span>
    </div>
  );
}
ModalNote.propTypes = {
  icon: PropTypes.string,
  message: PropTypes.string,
  status: PropTypes.string,
};
ModalNote.defaultProps = {
  icon: '',
  message: '',
  status: '',
};
