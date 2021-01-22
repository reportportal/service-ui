/*
 * Copyright 2020 EPAM Systems
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
import { Duration } from './duration';
import { Owner } from './owner';
import { Attributes } from './attributes';
import { Description } from './description';
import styles from './parentInfo.scss';

const cx = classNames.bind(styles);

export const ParentInfo = ({ parentItem }) => (
  <div className={cx('parent-info')}>
    <div className={cx('icon-holder')}>
      <Duration
        status={parentItem.status}
        startTime={parentItem.startTime}
        endTime={parentItem.endTime}
        approxTime={parentItem.approximateDuration}
      />
    </div>
    {parentItem.owner && (
      <div className={cx('icon-holder')}>
        <Owner owner={parentItem.owner} />
      </div>
    )}
    {parentItem.attributes.length > 0 && (
      <div className={cx('icon-holder')}>
        <Attributes attributes={parentItem.attributes} />
      </div>
    )}
    {parentItem.description && (
      <div className={cx('icon-holder')}>
        <Description description={parentItem.description} />
      </div>
    )}
  </div>
);
ParentInfo.propTypes = {
  parentItem: PropTypes.object,
};
ParentInfo.defaultProps = {
  parentItem: {
    attributes: [],
  },
};
