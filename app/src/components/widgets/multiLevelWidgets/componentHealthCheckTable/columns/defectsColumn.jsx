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
import { DefectStatistics } from 'pages/inside/common/launchSuiteGrid/defectStatistics';
import { DefectLink } from 'pages/inside/common/defectLink';
import { TEST_ITEM_PAGE } from 'controllers/pages';
import { TEST_ITEMS_TYPE_LIST, DEFAULT_LAUNCHES_LIMIT } from 'controllers/testItem';
import { defaultDefectsMessages } from 'components/widgets/singleLevelWidgets/tables/components/messages';
import { getItemNameConfig } from 'components/widgets/common/utils';
import { TARGET } from '../constants';
import styles from '../componentHealthCheckTable.scss';

const cx = classNames.bind(styles);

const getDefects = (values, name) => {
  const defects = Object.keys(values)
    .filter((item) => item.indexOf(name) !== -1)
    .map((defect) => {
      const value = values[defect];
      const { locator } = getItemNameConfig(defect);

      return {
        [locator]: value,
      };
    });

  return Object.assign({}, ...defects);
};

export const DefectsColumn = (
  { className, value },
  name,
  { isLatest, getCompositeAttributes, linkPayload },
) => {
  const data = value.statistics
    ? getDefects(value.statistics, name)
    : getDefects(value.total.statistics, name);
  const defaultColumnProps = {
    itemId: TEST_ITEMS_TYPE_LIST,
    target: TARGET,
    listViewLinkParams: {
      isLatest,
      launchesLimit: DEFAULT_LAUNCHES_LIMIT,
      compositeAttribute: getCompositeAttributes(value.attributeValue),
      filterType: true,
    },
    ownLinkParams: {
      type: TEST_ITEM_PAGE,
      payload: linkPayload,
    },
  };

  return (
    <div className={cx('defect-col', className)}>
      {value.statistics ? (
        <Fragment>
          <div className={cx('desktop-block')}>
            <DefectStatistics type={name} data={data} {...defaultColumnProps} />
          </div>
          <div className={cx('mobile-block', `defect-${name}`)}>
            <div className={cx('block-content')}>
              {!!data.total && (
                <DefectLink {...defaultColumnProps} defects={Object.keys(data)}>
                  {data.total}
                </DefectLink>
              )}
              <span className={cx('message')}>{defaultDefectsMessages[name]}</span>
            </div>
          </div>
        </Fragment>
      ) : (
        <Fragment>
          <span className={cx('mobile-hint')}>{defaultDefectsMessages[name]}</span>
          <span className={cx('total-item')}>{data.total}</span>
        </Fragment>
      )}
    </div>
  );
};
DefectsColumn.propTypes = {
  value: PropTypes.object.isRequired,
  className: PropTypes.string.isRequired,
};
