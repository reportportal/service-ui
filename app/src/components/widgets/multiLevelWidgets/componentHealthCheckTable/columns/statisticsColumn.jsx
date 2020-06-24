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
import Link from 'redux-first-router-link';
import { getStatisticsStatuses } from 'components/widgets/singleLevelWidgets/tables/components/utils';
import { defaultStatisticsMessages } from 'components/widgets/singleLevelWidgets/tables/components/messages';
import styles from '../componentHealthCheckTable.scss';

const cx = classNames.bind(styles);

export const StatisticsColumn = ({ className, value }, name, { onStatisticsClick }) => {
  const itemValue = Number(value.statistics && value.statistics[name]);
  const statuses = getStatisticsStatuses(name);

  return (
    <div className={cx('statistics-col', className)}>
      {value.statistics ? (
        <Fragment>
          <div className={cx('desktop-block')}>
            {!!itemValue && (
              <Link className={cx('link')} to={onStatisticsClick(statuses)} target="_blank">
                {itemValue}
              </Link>
            )}
          </div>
          <div className={cx('mobile-block', `statistics-${name.split('$')[2]}`)}>
            <div className={cx('block-content')}>
              {!!itemValue && (
                <Link className={cx('link')} to={onStatisticsClick(statuses)} target="_blank">
                  {itemValue}
                </Link>
              )}
              <span className={cx('message')}>{defaultStatisticsMessages[name]}</span>
            </div>
          </div>
        </Fragment>
      ) : (
        <span className={cx('total-item')}>{Number(value.total && value.total[name])}</span>
      )}
    </div>
  );
};

StatisticsColumn.propTypes = {
  value: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
};
