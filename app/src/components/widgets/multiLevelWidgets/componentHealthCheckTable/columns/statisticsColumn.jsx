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

import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import { TEST_ITEM_PAGE } from 'controllers/pages';
import { TEST_ITEMS_TYPE_LIST, DEFAULT_LAUNCHES_LIMIT } from 'controllers/testItem';
import { ExecutionStatistics } from 'pages/inside/common/launchSuiteGrid/executionStatistics';
import { StatisticsLink } from 'pages/inside/common/statisticsLink';
import { getStatisticsStatuses } from 'components/widgets/singleLevelWidgets/tables/components/utils';
import { defaultStatisticsMessages } from 'components/widgets/singleLevelWidgets/tables/components/messages';
import { TARGET } from '../constants';
import styles from '../componentHealthCheckTable.scss';

const cx = classNames.bind(styles);

export const StatisticsColumn = (
  { className, value },
  name,
  { isLatest, getCompositeAttributes, linkPayload },
) => {
  const itemValue = Number(value.statistics && value.statistics[name]);
  const totalValue = Number(value.total && value.total.statistics[name]);
  const defaultColumnProps = {
    itemId: TEST_ITEMS_TYPE_LIST,
    target: TARGET,
    statuses: getStatisticsStatuses(name),
    listViewLinkParams: {
      isLatest,
      launchesLimit: DEFAULT_LAUNCHES_LIMIT,
      compositeAttribute: getCompositeAttributes(value.attributeValue),
    },
    ownLinkParams: {
      type: TEST_ITEM_PAGE,
      payload: linkPayload,
    },
  };

  return (
    <div className={cx('statistics-col', className)}>
      {value.statistics ? (
        <Fragment>
          <div className={cx('desktop-block')}>
            {!!itemValue && <ExecutionStatistics value={itemValue} {...defaultColumnProps} />}
          </div>
          <div className={cx('mobile-block', `statistics-${name.split('$')[2]}`)}>
            <div className={cx('block-content')}>
              {!!itemValue && (
                <StatisticsLink className={cx('link')} {...defaultColumnProps}>
                  {itemValue}
                </StatisticsLink>
              )}
              <span className={cx('message')}>{defaultStatisticsMessages[name]}</span>
            </div>
          </div>
        </Fragment>
      ) : (
        !!totalValue && (
          <Fragment>
            <span className={cx('mobile-hint')}>{defaultStatisticsMessages[name]}</span>
            <span className={cx('total-item')}>{totalValue}</span>
          </Fragment>
        )
      )}
    </div>
  );
};

StatisticsColumn.propTypes = {
  value: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
};
