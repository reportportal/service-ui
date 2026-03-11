/*
 * Copyright 2019 EPAM Systems
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

import PropTypes from 'prop-types';
import { useRef, useState, useEffect } from 'react';
import classNames from 'classnames/bind';
import styles from './testItemStatus.scss';

const cx = classNames.bind(styles);

export const TestItemStatus = ({ status, className, captionClassName }) => {
  const statusRef = useRef(null);
  const [isStatusOverflowed, setIsStatusOverflowed] = useState(false);

  useEffect(() => {
    const element = statusRef.current;
    if (!element) return;

    const checkOverflow = () => {
      const { offsetWidth, scrollWidth } = element;
      setIsStatusOverflowed(scrollWidth > offsetWidth);
    };

    checkOverflow();

    const resizeObserver = new ResizeObserver(() => {
      checkOverflow();
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [status]);

  return (
    <div className={cx('status-container', className)}>
      <div className={cx('indicator', status.toLowerCase())} />
      <div
        ref={statusRef}
        className={cx('status', captionClassName)}
        title={isStatusOverflowed ? status : undefined}
      >
        {status}
      </div>
    </div>
  );
};

TestItemStatus.propTypes = {
  status: PropTypes.string,
  className: PropTypes.string,
  captionClassName: PropTypes.string,
};

TestItemStatus.defaultProps = {
  status: '',
  className: '',
  captionClassName: '',
};
