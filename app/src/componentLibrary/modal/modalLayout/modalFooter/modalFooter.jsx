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
import { Button } from 'componentLibrary/button';
import styles from './modalFooter.scss';

const cx = classNames.bind(styles);

export const ModalFooter = ({ okButton, cancelButton, closeHandler, footerNode }) => {
  return (
    <div className={cx('modal-footer')}>
      {footerNode && footerNode}
      <div className={cx('buttons-block')}>
        {cancelButton && (
          <div className={cx('button-container')}>
            <Button variant="ghost" onClick={closeHandler} disabled={cancelButton.disabled}>
              {cancelButton.text}
            </Button>
          </div>
        )}
        {okButton && (
          <div className={cx('button-container')}>
            <Button
              variant={okButton.danger ? 'danger' : 'topaz'}
              onClick={okButton.onClick}
              disabled={okButton.disabled}
              type={okButton.attributes && okButton.attributes.type}
              form={okButton.attributes && okButton.attributes.form}
            >
              {okButton.text}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
ModalFooter.propTypes = {
  okButton: PropTypes.shape({
    text: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    danger: PropTypes.bool,
    onClick: PropTypes.func,
    eventInfo: PropTypes.object,
    attributes: PropTypes.shape({
      type: PropTypes.string,
      form: PropTypes.string,
    }),
  }),
  cancelButton: PropTypes.shape({
    text: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
  }),
  closeHandler: PropTypes.func,
  footerNode: PropTypes.node,
};
ModalFooter.defaultProps = {
  okButton: null,
  cancelButton: null,
  closeHandler: () => {},
  footerNode: PropTypes.node,
};
