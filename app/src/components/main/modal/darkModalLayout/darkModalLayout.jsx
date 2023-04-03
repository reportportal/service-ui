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

import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { useDispatch } from 'react-redux';
import { hideModalAction } from 'controllers/modal';
import ErrorInlineIcon from 'common/img/error-inline.svg';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { ModalHeader } from './modalHeader';
import { ModalNote } from './modalNote';
import styles from './darkModalLayout.scss';

const cx = classNames.bind(styles);

export const DarkModalLayout = ({
  headerTitle,
  children,
  modalHasChanges,
  hotKeyAction,
  modalNote,
  sideSection,
  footer,
}) => {
  const [clickOutside, setClickOutside] = useState(false);
  const [isCtrlEnterPress, setIsCtrlEnterPress] = useState(false);
  const dispatch = useDispatch();
  const wrapperRef = useRef();

  const closeModalWindow = () => {
    dispatch(hideModalAction());
  };
  const handleClickOutside = (event) => {
    if (wrapperRef && !wrapperRef.current.contains(event.target)) {
      setClickOutside(true);
      if (!modalHasChanges) {
        closeModalWindow();
      }
    }
  };
  const onKeydown = (e) => {
    if (e.keyCode === 27) {
      closeModalWindow();
    }
    if ((e.ctrlKey && e.keyCode === 13) || (e.metaKey && e.keyCode === 13)) {
      setIsCtrlEnterPress(true);
    }
  };
  const onKeyup = (e) => {
    if ((e.ctrlKey && e.keyCode === 13) || (e.metaKey && e.keyCode === 13)) {
      setIsCtrlEnterPress(false);
    }
  };
  useEffect(() => {
    document.addEventListener('keydown', onKeydown);
    document.addEventListener('keyup', onKeyup);
    return () => {
      document.removeEventListener('keydown', onKeydown);
      document.removeEventListener('keyup', onKeyup);
    };
  }, []);
  useEffect(() => {
    modalHasChanges && isCtrlEnterPress && hotKeyAction.ctrlEnter();
  }, [isCtrlEnterPress]);

  return (
    <div className={cx('container')} onClick={handleClickOutside}>
      <div className={cx('modal-content')} ref={wrapperRef}>
        <div className={cx('wrapper')}>
          {sideSection && (
            <div className={cx('side-section')}>
              <ScrollWrapper hideTracksWhenNotNeeded autoHide>
                {sideSection}
              </ScrollWrapper>
            </div>
          )}
          <div className={cx('layout', { 'deep-black': !sideSection })}>
            <ModalHeader text={headerTitle} onClose={closeModalWindow} />
            <ScrollWrapper hideTracksWhenNotNeeded autoHide>
              {children}
              <div className={cx('note-row')}>
                {modalNote && clickOutside && modalHasChanges && (
                  <ModalNote message={modalNote} icon={ErrorInlineIcon} status={'error'} />
                )}
              </div>
            </ScrollWrapper>
          </div>
        </div>
        {footer && <div className={cx('footer')}>{footer}</div>}
      </div>
    </div>
  );
};
DarkModalLayout.propTypes = {
  headerTitle: PropTypes.string,
  children: PropTypes.node,
  modalHasChanges: PropTypes.bool,
  hotKeyAction: PropTypes.objectOf(PropTypes.func),
  modalNote: PropTypes.string,
  sideSection: PropTypes.node,
  footer: PropTypes.node,
};
DarkModalLayout.defaultProps = {
  headerTitle: '',
  children: null,
  modalHasChanges: false,
  hotKeyAction: {},
  modalNote: '',
  sideSection: null,
  footer: null,
};
