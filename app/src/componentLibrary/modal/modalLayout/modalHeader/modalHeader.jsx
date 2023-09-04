/*
 * Copyright 2022 EPAM Systems
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
import CloseIcon from '../img/close-icon-inline.svg';
import styles from './modalHeader.scss';

const cx = classNames.bind(styles);

// TODO: remove data-automation-id={'closeModalIcon'}
export const ModalHeader = ({ title, onClose, headerNode }) => (
  <div className={cx('modal-header')}>
    <div className={cx('modal-header-content')}>
      {title && <span className={cx('modal-title')}>{title}</span>}
      {headerNode && headerNode}
    </div>
    <div className={cx('close-modal-icon')} onClick={onClose} data-automation-id={'closeModalIcon'}>
      {Parser(CloseIcon)}
    </div>
  </div>
);
ModalHeader.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  onClose: PropTypes.func,
  headerNode: PropTypes.node,
};
ModalHeader.defaultProps = {
  title: '',
  onClose: () => {},
  headerNode: null,
};
