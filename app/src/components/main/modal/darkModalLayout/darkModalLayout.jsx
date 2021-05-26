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
import { useIntl } from 'react-intl';
import { hideModalAction } from 'controllers/modal';
import ErrorInlineIcon from 'common/img/error-inline.svg';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import ShowLess from 'common/img/show-less-inline.svg';
import ShowMore from 'common/img/show-more-inline.svg';
import Parser from 'html-react-parser';
import { messages } from 'pages/inside/stepPage/modals/editDefectModals/messages';
import { ModalHeader } from './modalHeader';
import { ModalNote } from './modalNote';
import styles from './darkModalLayout.scss';

const cx = classNames.bind(styles);

export const DarkModalLayout = ({
  title,
  renderHeaderElements,
  children,
  modalHasChanges,
  hotKeyAction,
  modalNote,
  collapsedRightSection,
  setRightSectionCollapsed,
  renderRightSection,
}) => {
  const [clickOutside, setClickOutside] = useState(false);
  const [isCtrlEnterPress, setIsCtrlEnterPress] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const wrapperRef = useRef();

  const closeModalWindow = () => {
    setIsOpen(false);
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
    setIsOpen(true);
    document.addEventListener('keydown', onKeydown);
    document.addEventListener('keyup', onKeyup);
    return () => {
      document.removeEventListener('keydown', onKeydown);
      document.removeEventListener('keyup', onKeyup);
    };
  }, []);
  useEffect(() => {
    isCtrlEnterPress && hotKeyAction.ctrlEnter();
  }, [isCtrlEnterPress]);

  return (
    <CSSTransition
      timeout={300}
      in={isOpen}
      classNames={cx('window-animation')}
      onExited={() => dispatch(hideModalAction())}
    >
      {(status) => (
        <div className={cx('modal-content')}>
          <div className={cx('container')} onClick={handleClickOutside}>
            <div ref={wrapperRef} className={cx('wrapper')}>
              <div className={cx('layout', { 'narrow-view': !collapsedRightSection })}>
                <ModalHeader
                  text={title}
                  onClose={closeModalWindow}
                  renderHeaderElements={renderHeaderElements}
                />
                <ScrollWrapper hideTracksWhenNotNeeded autoHide>
                  {status !== 'exited' ? children : null}
                  <div className={cx('note-row')}>
                    {modalNote && clickOutside && modalHasChanges && (
                      <ModalNote message={modalNote} icon={ErrorInlineIcon} status={'error'} />
                    )}
                  </div>
                </ScrollWrapper>
              </div>
            </div>
          </div>
          <div className={cx('right-section', { 'narrow-view': collapsedRightSection })}>
            <ScrollWrapper hideTracksWhenNotNeeded autoHide>
              <div className={cx('header')}>
                <button
                  className={cx('button')}
                  onClick={() => setRightSectionCollapsed(!collapsedRightSection)}
                >
                  <i className={cx('show-icon')}>
                    {Parser(collapsedRightSection ? ShowMore : ShowLess)}
                  </i>{' '}
                  <span className={cx('show-icon-prefix')}>
                    {collapsedRightSection
                      ? formatMessage(messages.seeMore)
                      : formatMessage(messages.seeLess)}
                  </span>
                </button>
              </div>
              {renderRightSection()}
            </ScrollWrapper>
          </div>
        </div>
      )}
    </CSSTransition>
  );
};
DarkModalLayout.propTypes = {
  title: PropTypes.string,
  renderHeaderElements: PropTypes.func,
  children: PropTypes.node,
  modalHasChanges: PropTypes.bool,
  hotKeyAction: PropTypes.objectOf(PropTypes.func),
  modalNote: PropTypes.string,
  collapsedRightSection: PropTypes.bool,
  renderRightSection: PropTypes.func,
  setRightSectionCollapsed: PropTypes.func,
};
DarkModalLayout.defaultProps = {
  title: '',
  renderHeaderElements: () => {},
  children: null,
  modalHasChanges: false,
  hotKeyAction: {},
  modalNote: '',
  collapsedRightSection: false,
  renderRightSection: () => {},
  setRightSectionCollapsed: () => {},
};
