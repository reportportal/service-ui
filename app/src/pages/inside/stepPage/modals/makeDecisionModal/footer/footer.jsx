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
import styles from './footer.scss';

const cx = classNames.bind(styles);

export const Footer = ({ modalState, buttons, infoBlock, isBulkOperation }) => {
  const InfoComponent = infoBlock;

  return (
    <div className={cx('container')}>
      {infoBlock &&
        (typeof infoBlock === 'string' ? (
          infoBlock
        ) : (
          <InfoComponent modalState={modalState} isBulkOperation={isBulkOperation} />
        ))}
      <div className={cx('buttons-bar')}>
        <span className={cx('button')}>{buttons.cancelButton}</span>
        {buttons.okButton}
      </div>
    </div>
  );
};
Footer.propTypes = {
  modalState: PropTypes.object,
  buttons: PropTypes.object,
  infoBlock: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
  isBulkOperation: PropTypes.bool,
};
Footer.defaultProps = {
  modalState: {},
  buttons: {},
  infoBlock: null,
  isBulkOperation: false,
};
