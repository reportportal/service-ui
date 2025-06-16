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
import { NavLink } from 'components/main/navLink';
import styles from './breadcrumb.scss';

const cx = classNames.bind(styles);

export function Breadcrumb({
  maxBreadcrumbWidth,
  titleTailNumChars,
  descriptor: { title, link, onClick },
  isClickable,
}) {
  const ref = useRef();
  const [breadcrumbTitle, setBreadcrumbTitle] = useState(null);

  useEffect(() => {
    const { offsetWidth, scrollWidth, dataset } = ref.current;

    if (offsetWidth < scrollWidth) {
      dataset.tail = title.slice(title.length - titleTailNumChars);
      setBreadcrumbTitle(title);
    }
  }, [title, titleTailNumChars]);

  return (
    <div className={cx('breadcrumb')} title={breadcrumbTitle}>
      {isClickable ? (
        <NavLink className={cx('link')} to={link} onClick={onClick}>
          <div ref={ref} className={cx('breadcrumb-text')} style={{ maxWidth: maxBreadcrumbWidth }}>
            {title}
          </div>
        </NavLink>
      ) : (
        <div ref={ref} className={cx('breadcrumb-text')} style={{ maxWidth: maxBreadcrumbWidth }}>
          {title}
        </div>
      )}
    </div>
  );
}

Breadcrumb.propTypes = {
  maxBreadcrumbWidth: PropTypes.number,
  titleTailNumChars: PropTypes.number,
  descriptor: PropTypes.shape({
    title: PropTypes.string.isRequired,
    link: PropTypes.object.isRequired,
    onClick: PropTypes.func,
  }).isRequired,
  isClickable: PropTypes.bool,
};

Breadcrumb.defaultProps = {
  maxBreadcrumbWidth: 132,
  titleTailNumChars: 8,
  isClickable: true,
};
