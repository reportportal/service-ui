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

import React, { useState } from 'react';
import { Manager, Popper, Reference } from 'react-popper';
import classNames from 'classnames/bind';
import ReactDOM from 'react-dom';
import styles from './withTooltip.scss';

const cx = classNames.bind(styles);
const TOOLTIP_DELAY_MS = 2000;
const SAFE_ZONE = 100;

export const withTooltip = ({
  ContentComponent,
  tooltipWrapperClassName,
  dynamicWidth,
  width,
  topOffset,
  leftOffset,
  side,
  noArrow,
  dataAutomationId,
}) => (WrappedComponent) => (props) => {
  const [isOpened, setOpened] = useState(false);
  const [currentTimeout, setCurrentTimeout] = useState(null);
  const styleWidth = dynamicWidth ? null : { width };
  const clientWidth = document.documentElement.clientWidth;
  const maxWidth = !styleWidth ? clientWidth - SAFE_ZONE : styleWidth;
  const tooltipRoot = document.getElementById('tooltip-root');
  return (
    <Manager>
      <Reference>
        {({ ref }) => (
          <div
            ref={ref}
            className={cx('with-tooltip', tooltipWrapperClassName)}
            onMouseEnter={() => {
              setCurrentTimeout(setTimeout(() => setOpened(true), TOOLTIP_DELAY_MS));
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
        )}
      </Reference>
      {isOpened &&
        ReactDOM.createPortal(
          <Popper placement={side} eventsEnabled={false}>
            {({ placement, ref, style, arrowProps }) => (
              <div
                className={cx('tooltip')}
                ref={ref}
                style={{
                  ...style,
                  ...styleWidth,
                  top: style.top + topOffset,
                  left: style.left + leftOffset,
                }}
                data-placement={placement}
                data-automation-id={dataAutomationId}
              >
                <div
                  className={cx('tooltip-content')}
                  style={{
                    maxWidth: `${maxWidth}px`,
                  }}
                >
                  <ContentComponent {...props} />
                  {!noArrow && (
                    <div
                      className={cx('tooltip-arrow')}
                      data-placement={placement}
                      ref={arrowProps.ref}
                      style={arrowProps.style}
                    />
                  )}
                </div>
              </div>
            )}
          </Popper>,
          tooltipRoot,
        )}
    </Manager>
  );
};
