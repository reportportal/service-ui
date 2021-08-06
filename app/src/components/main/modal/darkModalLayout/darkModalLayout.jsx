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
import { useIntl, defineMessages } from 'react-intl';
import { useTracking } from 'react-tracking';
import { hideModalAction } from 'controllers/modal';
import ErrorInlineIcon from 'common/img/error-inline.svg';
import ShowLess from 'common/img/show-less-inline.svg';
import ShowMore from 'common/img/show-more-inline.svg';
import { APPLICATION_SETTINGS } from 'common/constants/localStorageKeys';
import { updateStorageItem, getStorageItem } from 'common/utils';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import Parser from 'html-react-parser';
import { useWindowResize } from 'common/hooks';
import { SCREEN_XS_MAX } from 'common/constants/screenSizeVariables';
import { ModalHeader } from './modalHeader';
import { ModalNote } from './modalNote';
import styles from './darkModalLayout.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  seeMore: { id: 'DarkModalLayout.seeMore', defaultMessage: 'See details & error logs' },
  seeLess: { id: 'DarkModalLayout.seeLess', defaultMessage: 'See less' },
});

export const DarkModalLayout = ({
  renderTitle,
  renderHeaderElements,
  children,
  modalHasChanges,
  hotKeyAction,
  modalNote,
  renderRightSection,
  eventsInfo,
}) => {
  const { trackEvent } = useTracking();
  const applicationSettings = getStorageItem(APPLICATION_SETTINGS);
  const collapsedRightSectionInitialState = applicationSettings
    ? applicationSettings.darkModalCollapsedRightSection
    : true;
  const [clickOutside, setClickOutside] = useState(false);
  const [isCtrlEnterPress, setIsCtrlEnterPress] = useState(false);
  const [collapsedRightSection, setRightSectionCollapsed] = useState(
    collapsedRightSectionInitialState,
  );
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const wrapperRef = useRef();
  const windowSize = useWindowResize();
  const collapseRightSection = () => {
    setRightSectionCollapsed(!collapsedRightSection);
    updateStorageItem(APPLICATION_SETTINGS, {
      darkModalCollapsedRightSection: !collapsedRightSection,
    });
    eventsInfo.openCloseRightSection &&
      trackEvent(eventsInfo.openCloseRightSection(collapsedRightSection));
  };
  const { width } = windowSize;

  const closeModalWindow = () => {
    dispatch(hideModalAction());
    eventsInfo.closeModal && trackEvent(eventsInfo.closeModal(Date.now()));
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
    isCtrlEnterPress && hotKeyAction.ctrlEnter();
  }, [isCtrlEnterPress]);
  useEffect(() => {
    if (width && width < SCREEN_XS_MAX && !collapsedRightSection) {
      setRightSectionCollapsed(true);
    }
  }, [windowSize]);
  const visibilityRightSectionButton = () => width < SCREEN_XS_MAX;

  return (
    <div className={cx('modal-content')}>
      <div className={cx('container')} onClick={handleClickOutside}>
        <div ref={wrapperRef} className={cx('wrapper')}>
          <div className={cx('layout')}>
            <ModalHeader
              text={renderTitle(collapsedRightSection, windowSize)}
              onClose={closeModalWindow}
              renderHeaderElements={renderHeaderElements}
            />
            <ScrollWrapper hideTracksWhenNotNeeded autoHide>
              {children({ collapsedRightSection, windowSize })}
              <div className={cx('note-row')}>
                {modalNote && clickOutside && modalHasChanges && (
                  <ModalNote message={modalNote} icon={ErrorInlineIcon} status={'error'} />
                )}
              </div>
            </ScrollWrapper>
          </div>
        </div>
      </div>
      {width > SCREEN_XS_MAX && (
        <div className={cx('right-section', { 'narrow-view': collapsedRightSection })}>
          <ScrollWrapper hideTracksWhenNotNeeded autoHide>
            <div className={cx('header')}>
              <button
                className={cx('button', {
                  hidden: visibilityRightSectionButton(),
                })}
                onClick={collapseRightSection}
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
            {renderRightSection(collapsedRightSection)}
          </ScrollWrapper>
        </div>
      )}
    </div>
  );
};
DarkModalLayout.propTypes = {
  renderTitle: PropTypes.func,
  renderHeaderElements: PropTypes.func,
  children: PropTypes.func,
  modalHasChanges: PropTypes.bool,
  hotKeyAction: PropTypes.objectOf(PropTypes.func),
  modalNote: PropTypes.string,
  renderRightSection: PropTypes.func,
  eventsInfo: PropTypes.object,
};
DarkModalLayout.defaultProps = {
  renderTitle: () => {},
  renderHeaderElements: () => {},
  children: () => {},
  modalHasChanges: false,
  hotKeyAction: {},
  modalNote: '',
  renderRightSection: () => {},
  eventsInfo: {},
};
