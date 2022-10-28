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
const TOOLTIP_DELAY_MS = 2000;

export const withTooltip = ({ ContentComponent, tooltipWrapperClassName, ...tooltipConfig }) => (
  WrappedComponent,
) => (props) => {
  const parentRef = useRef();

  const [isOpened, setOpened] = useState(false);
  const [isActive, setActive] = useState(false);
  const [coords, setCoords] = useState({ clientX: 0, clientY: 0 });
  const [currentTimeout, setCurrentTimeout] = useState(null);

  const getTooltipPosition = ({ clientX, clientY }) => {
    if (isActive) {
      setCoords({ clientX, clientY });
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', getTooltipPosition);

    return () => {
      window.removeEventListener('mousemove', getTooltipPosition);
    };
  }, [getTooltipPosition]);

  return (
    <>
      <div
        ref={parentRef}
        className={cx('with-tooltip', tooltipWrapperClassName)}
        onMouseEnter={() => {
          setActive(true);
          setCurrentTimeout(setTimeout(() => setOpened(true), TOOLTIP_DELAY_MS));
        }}
        onMouseLeave={() => {
          if (currentTimeout) {
            clearTimeout(currentTimeout);
          }
          setActive(false);
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
