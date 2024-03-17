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

import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames/bind';
import { activeModalSelector, hideModalAction } from 'controllers/modal';
import { useDispatch, useSelector } from 'react-redux';
import { Popover } from '../popover';
import styles from './withPopover.scss';

const cx = classNames.bind(styles);

export const withPopover = ({
  ContentComponent,
  popoverWrapperClassName,
  popoverId,
  ...popoverConfig
}) => (WrappedComponent) => (props) => {
  const parentRef = useRef();
  const dispatch = useDispatch();
  const activePopover = useSelector(activeModalSelector)?.id || '';
  const [isOpened, setOpened] = useState(false);

  useEffect(() => {
    popoverId && setOpened(activePopover === popoverId);
  }, [activePopover]);

  const onClose = () => {
    dispatch(hideModalAction());
    setOpened(false);
  };

  return (
    <>
      <div
        ref={parentRef}
        className={cx('with-popover', popoverWrapperClassName)}
        onClick={() => {
          setOpened(true);
        }}
      >
        <WrappedComponent isPopoverOpen={isOpened} {...props} />
      </div>
      {isOpened && (
        <Popover onClose={onClose} parentRef={parentRef} {...popoverConfig}>
          <ContentComponent closePopover={onClose} {...props} />
        </Popover>
      )}
    </>
  );
};
