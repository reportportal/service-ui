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
import { Tooltip } from '../tooltip';
import styles from './withTooltip.scss';

const cx = classNames.bind(styles);
const TOOLTIP_DELAY = 2000;

export const withTooltip = ({ ContentComponent, tooltipWrapperClassName, ...tooltipConfig }) => (
  WrappedComponent,
) => (props) => {
  const parentRef = useRef();
  const [isOpened, setOpened] = useState(false);

  const [coords, setCoords] = useState({ clientX: 0, clientY: 0 });
  const [currentTimeout, setCurrentTimeout] = useState(null);

  const getTooltipPosition = ({ clientX, clientY }) => {
    setCoords({ clientX, clientY });
  };

  const addListener = () => {
    window.addEventListener('mousemove', getTooltipPosition);
  };

  const removeListener = () => {
    window.removeEventListener('mousemove', getTooltipPosition);
  };

  useEffect(() => {
    addListener();

    return () => {
      removeListener();
    };
  }, [addListener, removeListener]);

  return (
    <>
      <div
        ref={parentRef}
        className={cx('with-tooltip', tooltipWrapperClassName)}
        onMouseEnter={() => {
          setCurrentTimeout(setTimeout(() => setOpened(true), TOOLTIP_DELAY));
        }}
        onMouseLeave={() => {
          if (currentTimeout) {
            clearTimeout(currentTimeout);
          }
          setOpened(false);
        }}
      >
        <WrappedComponent isTooltipOpen={isOpened} {...props} />
      </div>
      {isOpened && (
        <Tooltip parentRef={parentRef} {...tooltipConfig} coords={coords}>
          <ContentComponent {...props} />
        </Tooltip>
      )}
    </>
  );
};
