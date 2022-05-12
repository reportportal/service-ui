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

import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Scrollbars } from 'react-custom-scrollbars';
import { CSSTransition } from 'react-transition-group';
import classNames from 'classnames/bind';
import { ModalContent } from './modalContent';
import { ModalFooter } from './modalFooter';
import { ModalHeader } from './modalHeader';
import styles from './modalLayout.scss';

const ESC_KEYCODE = 27;
const cx = classNames.bind(styles);

export const ModalLayout = ({
  title,
  headerNode,
  children,
  footerNode,
  okButton,
  cancelButton,
  className,
  modalSize,
  onClose,
}) => {
  const [isShown, setShown] = useState(false);

  const onKeydown = (e) => {
    if (e.keyCode === ESC_KEYCODE) {
      setShown(false);
    }
  };
  useEffect(() => {
    document.addEventListener('keydown', onKeydown, false);
    setShown(true);

    return () => document.removeEventListener('keydown', onKeydown, false);
  }, []);

  const closeModal = () => {
    setShown(false);
  };

  return (
    <div className={cx('modal-layout')}>
      <div className={cx('scrolling-content')}>
        <Scrollbars>
          <CSSTransition
            timeout={300}
            in={isShown}
            classNames={cx('modal-window-animation')}
            onExited={onClose}
          >
            {(status) => (
              <div className={cx('modal-window', { [`size-${modalSize}`]: modalSize }, className)}>
                <ModalHeader title={title} headerNode={headerNode} onClose={closeModal} />
                <ModalContent>{status !== 'exited' ? children : null}</ModalContent>
                <ModalFooter
                  footerNode={footerNode}
                  okButton={okButton}
                  cancelButton={cancelButton}
                  closeHandler={closeModal}
                />
              </div>
            )}
          </CSSTransition>
        </Scrollbars>
      </div>
    </div>
  );
};
ModalLayout.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  headerNode: PropTypes.node,
  children: PropTypes.node,
  footerNode: PropTypes.node,
  okButton: PropTypes.shape({
    text: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    danger: PropTypes.bool,
    onClick: PropTypes.func,
    eventInfo: PropTypes.object,
    attributes: PropTypes.object,
  }),
  cancelButton: PropTypes.shape({
    text: PropTypes.string.isRequired,
    eventInfo: PropTypes.object,
  }),
  className: PropTypes.string,
  modalSize: PropTypes.oneOf(['default', 'small', 'large']),
  onClose: PropTypes.func,
};
ModalLayout.defaultProps = {
  title: '',
  headerNode: null,
  children: null,
  footerNode: null,
  okButton: null,
  cancelButton: null,
  className: '',
  modalSize: 'default',
  onClose: () => {},
};
