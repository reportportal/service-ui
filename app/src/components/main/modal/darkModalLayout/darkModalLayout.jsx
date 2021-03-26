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
import { CSSTransition } from 'react-transition-group';
import { useDispatch } from 'react-redux';
import { hideModalAction } from 'controllers/modal';
import ErrorInlineIcon from 'common/img/error-inline.svg';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { ModalNote } from './modalNote';
import { ModalContent } from './modalContent';
import { ModalHeader } from './modalHeader';
import styles from './darkModalLayout.scss';

const cx = classNames.bind(styles);

export const DarkModalLayout = ({
  title,
  renderHeaderElements,
  children,
  modalHasChanges,
  hotKeyAction,
  defaultNoteMessage,
}) => {
  const [isShown, setIsShown] = useState(false);
  const [clickOutside, setClickOutside] = useState(false);
  const dispatch = useDispatch();
  const wrapperRef = useRef();

  const closeModalWindow = () => {
    setIsShown(false);
    dispatch(hideModalAction());
  };
  const handleClickOutside = (event) => {
    if (wrapperRef && !wrapperRef.current.contains(event.target)) {
      setClickOutside(true);
      if (!modalHasChanges) {
        closeModalWindow();
      }
    } else {
      setClickOutside(false);
    }
  };
  const onKeydown = (e) => {
    if (e.keyCode === 27) {
      closeModalWindow();
    }
    if ((e.ctrlKey && e.keyCode === 13) || (e.metaKey && e.keyCode === 13)) {
      hotKeyAction.ctrlEnter();
    }
  };
  useEffect(() => {
    setIsShown(true);
    document.addEventListener('keydown', onKeydown, false);
    return () => {
      document.removeEventListener('keydown', onKeydown, false);
    };
  });

  return (
    <div className={cx('container')} onClick={handleClickOutside}>
      <CSSTransition
        timeout={300}
        in={isShown}
        classNames={cx('window-animation')}
        onExited={closeModalWindow}
      >
        {(status) => (
          <div ref={wrapperRef} className={cx('wrapper')}>
            <div className={cx('layout')}>
              <ModalHeader
                text={title}
                onClose={closeModalWindow}
                renderHeaderElements={renderHeaderElements}
              />
              <ScrollWrapper hideTracksWhenNotNeeded autoHide>
                <ModalContent>{status !== 'exited' ? children : null}</ModalContent>
              </ScrollWrapper>
              <div className={cx('note-row')}>
                {modalHasChanges && clickOutside && defaultNoteMessage && (
                  <ModalNote message={defaultNoteMessage} icon={ErrorInlineIcon} status={'error'} />
                )}
              </div>
            </div>
          </div>
        )}
      </CSSTransition>
    </div>
  );
};
DarkModalLayout.propTypes = {
  title: PropTypes.string,
  renderHeaderElements: PropTypes.func,
  children: PropTypes.node,
  modalHasChanges: PropTypes.bool,
  hotKeyAction: PropTypes.objectOf(PropTypes.func),
  defaultNoteMessage: PropTypes.string,
};
DarkModalLayout.defaultProps = {
  title: '',
  renderHeaderElements: () => {},
  children: null,
  modalHasChanges: false,
  hotKeyAction: {},
  defaultNoteMessage: '',
};
