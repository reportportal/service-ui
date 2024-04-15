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

import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import { Popover } from '../popover';
import styles from './withPopover.scss';

const cx = classNames.bind(styles);

export const withPopover = ({
  ContentComponent,
  popoverWrapperClassName,
  tabIndex,
  ...popoverConfig
}) => (WrappedComponent) => ({
  isOpenPopover,
  closePopover,
  setIsOpenPopover,
  closeNavbar,
  wrapperParentRef,
  ...props
}) => {
  const parentRef = useRef();
  const [isOpened, setOpened] = useState(false);

  useEffect(() => {
    if (isOpenPopover) {
      setOpened(true);
      setIsOpenPopover?.(true);
    }
  }, [isOpenPopover, setIsOpenPopover]);

  const onClose = () => {
    closePopover?.();
    setIsOpenPopover?.(false);
    setOpened(false);
  };

  const onCloseWrapperParentRef = () => {
    closeNavbar();
    onClose();
  };

  return (
    <>
      <button
        ref={parentRef}
        className={cx('with-popover', popoverWrapperClassName)}
        onClick={() => {
          setOpened(true);
          setIsOpenPopover?.(true);
        }}
        tabIndex={tabIndex ?? -1}
      >
        <WrappedComponent isPopoverOpen={isOpened} {...props} />
      </button>
      {isOpened && (
        <Popover
          onClose={onClose}
          parentRef={parentRef}
          onCloseWrapperParentRef={onCloseWrapperParentRef}
          wrapperParentRef={wrapperParentRef}
          {...popoverConfig}
        >
          <ContentComponent closePopover={onClose} closeNavbar={closeNavbar} {...props} />
        </Popover>
      )}
    </>
  );
};
