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

import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { StatisticsLink } from 'pages/inside/common/statisticsLink';
import React from 'react';
import styles from './executionStatistics.scss';

const cx = classNames.bind(styles);

export const ExecutionStatistics = ({
  value,
  title,
  bold,
  itemId,
  target,
  listViewLinkParams,
  statuses,
  ownLinkParams,
}) => (
  <div className={cx('execution-statistics')}>
    <span className={cx('title')}>{title.full}</span>
    {!!Number(value) && (
      <StatisticsLink
        itemId={itemId}
        statuses={statuses}
        target={target}
        listViewLinkParams={listViewLinkParams}
        className={cx('value', { bold })}
        ownLinkParams={ownLinkParams}
      >
        {value}
      </StatisticsLink>
    )}
  </div>
);

ExecutionStatistics.propTypes = {
  value: PropTypes.number,
  title: PropTypes.object,
  bold: PropTypes.bool,
  itemId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  statuses: PropTypes.arrayOf(PropTypes.string).isRequired,
  target: PropTypes.string,
  listViewLinkParams: PropTypes.shape({
    launchesLimit: PropTypes.number,
    compositeAttribute: PropTypes.string,
    isLatest: PropTypes.bool,
  }),
  ownLinkParams: PropTypes.shape({
    payload: PropTypes.object,
    page: PropTypes.string,
  }),
};
ExecutionStatistics.defaultProps = {
  bold: false,
  title: {},
  value: null,
  target: '',
  listViewLinkParams: {},
  ownLinkParams: {},
};
