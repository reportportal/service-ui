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
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { withPopover } from 'componentLibrary/popover';
import { Breadcrumb } from '../breadcrumb';
import { MeatballIconComponent } from './meatballIconComponent';
import styles from './meatball.scss';

const cx = classNames.bind(styles);

/* eslint-disable react/no-array-index-key */
export const Meatball = ({ paths, url }) => {
  const meatballPopoverContent = (
    <div className={cx('meatball-popover-content')}>
      {paths.map(({ path, text }, index) => (
        <div
          className={cx('meatball-popover-content-row')}
          style={{ paddingLeft: (index - 1) * 18 }}
        >
          {index !== 0 && <div className={cx('next-level-icon')} />}
          <Breadcrumb
            key={`hidden-breadcrumb-${index}`}
            maxBreadcrumbWidth={132}
            text={text || path}
            url={`${url}/${paths
              .map((p) => p.path)
              .slice(0, index + 1)
              .join('/')}`}
          />
        </div>
      ))}
    </div>
  );

  const MeatballWithPopover = withPopover({
    content: meatballPopoverContent,
    side: 'bottom',
    arrowPosition: 'left',
    popoverWrapperStyle: {
      display: 'inline-block',
      verticalAlign: 'top',
    },
  })(MeatballIconComponent);

  return (
    <div className={cx('meatball')}>
      <MeatballWithPopover />
    </div>
  );
};

Meatball.propTypes = {
  paths: PropTypes.arrayOf(
    PropTypes.shape({
      path: PropTypes.string,
      text: PropTypes.string,
    }),
  ),
  url: PropTypes.string,
};

Meatball.defaultProps = {
  paths: [],
  url: '',
};
