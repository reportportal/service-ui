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

import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './breadcrumb.scss';

const cx = classNames.bind(styles);

// todo add tooltip to <a> with {text} (EPMRPP-79184)
export const Breadcrumb = ({ maxBreadcrumbWidth, text, numChars, url }) => {
  const ref = useRef();

  useEffect(() => {
    const { offsetWidth, scrollWidth, dataset } = ref.current;

    if (offsetWidth < scrollWidth) {
      dataset.tail = text.slice(text.length - numChars);
    }
  }, [text, numChars]);

  return (
    <div className={cx('breadcrumb')}>
      <a
        ref={ref}
        className={cx('breadcrumb-text')}
        style={{ maxWidth: maxBreadcrumbWidth }}
        href={url}
      >
        {text}
      </a>
    </div>
  );
};

Breadcrumb.propTypes = {
  maxBreadcrumbWidth: PropTypes.number,
  text: PropTypes.string,
  numChars: PropTypes.number,
  url: PropTypes.string,
};

Breadcrumb.defaultProps = {
  hiddenPaths: [],
  text: '',
  numChars: 8,
  url: '',
};
