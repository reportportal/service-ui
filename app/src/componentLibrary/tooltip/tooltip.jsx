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

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import ReactDOM from 'react-dom';
import { Popper } from 'react-popper';
import styles from './tooltip.scss';

const cx = classNames.bind(styles);

export const Tooltip = (props) => {
  const {
    children,
    dynamicWidth,
    width,
    topOffset,
    leftOffset,
    side,
    modifiers,
    noArrow,
    dataAutomationId,
  } = props;
  const styleWidth = dynamicWidth ? null : { width };
  const clientWidth = document.documentElement.clientWidth;
  const maxWidth = !styleWidth ? clientWidth - 100 : styleWidth;
  const tooltipRoot = document.getElementById('tooltip-root');
  return ReactDOM.createPortal(
    <Popper placement={side} modifiers={modifiers} eventsEnabled={false}>
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
            {children}
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
  );
};

Tooltip.propTypes = {
  children: PropTypes.node,
  side: PropTypes.oneOf(['auto', 'top', 'bottom', 'left', 'right']),
  modifiers: PropTypes.object,
  noArrow: PropTypes.bool,
  width: PropTypes.number,
  dynamicWidth: PropTypes.bool,
  topOffset: PropTypes.number,
  leftOffset: PropTypes.number,
  dataAutomationId: PropTypes.string,
};

Tooltip.defaultProps = {
  children: null,
  side: 'top',
  modifiers: {},
  noArrow: false,
  width: 300,
  dynamicWidth: true,
  topOffset: 0,
  leftOffset: 0,
  dataAutomationId: '',
};
