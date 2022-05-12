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
import { useDispatch } from 'react-redux';
import { useTracking } from 'react-tracking';
import { Scrollbars } from 'react-custom-scrollbars';
import { CSSTransition } from 'react-transition-group';
import classNames from 'classnames/bind';
import { hideModalAction } from 'controllers/modal';
import { ModalContent } from './modalContent';
import { ModalFooter } from './modalFooter';
import { ModalHeader } from './modalHeader';
import styles from './modalLayout.scss';

const cx = classNames.bind(styles);

export const ModalLayout = ({
  title,
  headerNode,
  children,
  footerNode,
  okButton,
  cancelButton,
  closeIconEventInfo,
  className,
  modalSize,
}) => {
  const { trackEvent } = useTracking();
  const dispatch = useDispatch();
  const [isShown, setShown] = useState(false);

  const onKeydown = (e) => {
    if (e.keyCode === 27) {
      setShown(false);
    }
  };
  useEffect(() => {
    document.addEventListener('keydown', onKeydown, false);
    setShown(true);

    return () => document.removeEventListener('keydown', onKeydown, false);
  }, []);

  const onClose = (eventInfo) => {
    setShown(false);
    trackEvent(eventInfo);
  };

  return (
    <div className={cx('modal-layout')}>
      <div className={cx('scrolling-content')}>
        <Scrollbars>
          <CSSTransition
            timeout={300}
            in={isShown}
            classNames={cx('modal-window-animation')}
            onExited={() => dispatch(hideModalAction())}
          >
            {(status) => (
              <div className={cx('modal-window', { [`size-${modalSize}`]: modalSize }, className)}>
                <ModalHeader
                  title={title}
                  headerNode={headerNode}
                  onClose={() => onClose(closeIconEventInfo)}
                />
                <ModalContent>{status !== 'exited' ? children : null}</ModalContent>
                <ModalFooter
                  footerNode={footerNode}
                  okButton={okButton}
                  cancelButton={cancelButton}
                  closeHandler={() => onClose(cancelButton.eventInfo)}
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
  closeIconEventInfo: PropTypes.object,
  className: PropTypes.string,
  modalSize: PropTypes.oneOf(['default', 'small', 'large']),
};
ModalLayout.defaultProps = {
  title: '',
  headerNode: null,
  children: null,
  footerNode: null,
  okButton: null,
  cancelButton: null,
  closeIconEventInfo: null,
  className: '',
  modalSize: 'large',
};
