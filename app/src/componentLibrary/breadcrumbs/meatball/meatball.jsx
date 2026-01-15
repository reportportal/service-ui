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

const MeatballPopoverContent = ({ descriptors }) => (
  <div className={cx('meatball-popover-content')}>
    {descriptors.map((descriptor, index) => (
      <div key={descriptor.id} className={cx('meatball-popover-content-row')} style={{ paddingLeft: (index - 1) * 18 }}>
        {index !== 0 && <div className={cx('next-level-icon')} />}
        <Breadcrumb maxBreadcrumbWidth={132} descriptor={descriptor} />
      </div>
    ))}
  </div>
);

MeatballPopoverContent.propTypes = {
  descriptors: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      title: PropTypes.string,
      link: PropTypes.object,
    }),
  ),
};

MeatballPopoverContent.defaultProps = {
  descriptors: [],
};

export const Meatball = withPopover({
  ContentComponent: MeatballPopoverContent,
  side: 'bottom',
  arrowPosition: 'left',
  popoverWrapperClassName: cx('popover-wrapper'),
})(MeatballIconComponent);
