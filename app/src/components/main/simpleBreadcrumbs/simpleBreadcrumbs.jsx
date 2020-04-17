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

import { Fragment } from 'react';
import PropTypes from 'prop-types';
import Parser from 'html-react-parser';
import classNames from 'classnames/bind';
import RightArrowIcon from 'common/img/arrow-right-inline.svg';
import { SimpleBreadcrumb } from './simpleBreadcrumb';
import styles from './simpleBreadcrumbs.scss';

const cx = classNames.bind(styles);

export const SimpleBreadcrumbs = ({ descriptors, onClickItem }) => {
  const descriptorsLastIndex = descriptors.length - 1;

  return (
    <div className={cx('simple-breadcrumbs')}>
      {descriptors.map((descriptor, i) => (
        <Fragment key={descriptor.type}>
          {i > 0 && <div className={cx('separator')}>{Parser(RightArrowIcon)}</div>}
          <SimpleBreadcrumb
            descriptor={descriptor}
            active={i !== descriptorsLastIndex}
            onClick={() => onClickItem(descriptor)}
          />
        </Fragment>
      ))}
    </div>
  );
};

SimpleBreadcrumbs.propTypes = {
  descriptors: PropTypes.array,
  onClickItem: PropTypes.func,
};

SimpleBreadcrumbs.defaultProps = {
  descriptors: [],
  onClickItem: () => {},
};
