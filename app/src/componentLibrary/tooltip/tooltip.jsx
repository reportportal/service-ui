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
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './tooltip.scss';

const cx = classNames.bind(styles);
const TRIANGLE_SIZE = 9;
const SAFE_ZONE = 4;
const MARGIN = 8;

export const Tooltip = ({
  children,
  title,
  side,
  arrowPosition,
  dataAutomationId,
  parentRef,
  coords,
}) => {
  const tooltipRef = useRef();
  const [top, setTop] = useState(0);
  const [left, setLeft] = useState(0);

  useEffect(() => {
    const { current: parent } = parentRef;
    const parentHeight = parent.offsetHeight;
    const parentWidth = parent.offsetWidth;

    const { current: tooltip } = tooltipRef;
    const tooltipHeight = tooltip.offsetHeight;
    const tooltipWidth = tooltip.offsetWidth;

    const setHorizontalPosition = () => {
      switch (arrowPosition) {
        case 'right':
          setLeft(coords.clientX + parentWidth / 2 - tooltipWidth + TRIANGLE_SIZE + SAFE_ZONE + 5);
          break;
        case 'middle':
          setLeft(coords.clientX - tooltipWidth / 2);
          break;
        case 'left':
        default:
          setLeft(coords.clientX - TRIANGLE_SIZE - SAFE_ZONE - 11);
      }
    };

    const setVerticalMiddlePosition = () => {
      setTop(coords.clientY - tooltipHeight / 2);
    };

    if (side === 'bottom') {
      setTop(coords.clientY + parentHeight + SAFE_ZONE);
      setHorizontalPosition();
    } else if (side === 'top') {
      setTop(coords.clientY - tooltipHeight - TRIANGLE_SIZE - MARGIN - 2);
      setHorizontalPosition();
    } else if (side === 'right') {
      setVerticalMiddlePosition();
      setLeft(coords.clientX + TRIANGLE_SIZE + SAFE_ZONE + MARGIN);
    } else if (side === 'left') {
      setVerticalMiddlePosition();
      setLeft(coords.clientX - TRIANGLE_SIZE - SAFE_ZONE - tooltipWidth - MARGIN);
    }
  }, [parentRef, side, arrowPosition, coords]);

  return (
    <div
      className={cx('tooltip', `side-${side}`, `position-${arrowPosition}`)}
      data-automation-id={dataAutomationId}
      ref={tooltipRef}
      style={{ top, left }}
    >
      {title && <div className={cx('title')}>{title}</div>}
      <div className={cx('content')}>{children}</div>
    </div>
  );
};

Tooltip.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
  side: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  arrowPosition: PropTypes.oneOf(['left', 'middle', 'right']),
  dataAutomationId: PropTypes.string,
  parentRef: PropTypes.shape({ current: PropTypes.object }),
  coords: PropTypes.shape({ clientX: PropTypes.number, clientY: PropTypes.number }),
};

Tooltip.defaultProps = {
  children: null,
  title: '',
  side: 'top',
  arrowPosition: 'left',
  dataAutomationId: '',
  parentRef: null,
  coords: {},
};
