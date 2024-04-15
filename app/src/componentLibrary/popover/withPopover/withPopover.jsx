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

/* eslint-disable react/prop-types */

import React, { useRef, useState, useCallback } from 'react';
import classNames from 'classnames/bind';
import { Popover } from '../popover';
import styles from './withPopover.scss';

const cx = classNames.bind(styles);

export const withPopover = ({
  ContentComponent,
  popoverWrapperClassName,
  tabIndex,
  ...popoverConfig
}) => (WrappedComponent) => ({ isOpenPopover, togglePopover, ...props }) => {
  const parentRef = useRef();
  const [isOpened, setOpened] = useState(false);

  const onClose = useCallback(() => {
    if (togglePopover) {
      togglePopover(false);
    } else {
      setOpened(false);
    }
  }, [togglePopover, setOpened]);

  const onClickHandle = () => {
    if (togglePopover) {
      togglePopover(!isOpenPopover);
    } else {
      setOpened(true);
    }
  };

  const isPopoverOpened = togglePopover ? isOpenPopover : isOpened;

  return (
    <div ref={parentRef}>
      <button
        className={cx('with-popover', popoverWrapperClassName)}
        onClick={onClickHandle}
        tabIndex={tabIndex ?? -1}
      >
        <WrappedComponent isPopoverOpen={isPopoverOpened} {...props} />
      </button>
      {isPopoverOpened && (
        <Popover onClose={onClose} parentRef={parentRef} {...popoverConfig}>
          <ContentComponent closePopover={onClose} {...props} />
        </Popover>
      )}
    </div>
  );
};
