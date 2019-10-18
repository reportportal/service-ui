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

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import styles from './mostTimeConsumingTestCasesTable.scss';
import { TestsTableWidget } from '../../tables/components/testsTableWidget';
import * as cfg from './tableConfig';

const cx = classNames.bind(styles);

const prepareWidgetData = ({ result }) =>
  result.map((el) => ({
    type: el.type,
    path: el.path,
    id: el.id,
    name: el.name,
    uniqueId: el.uniqueId,
    startTime: el.startTime,
    status: [el.status.toLowerCase()],
    duration: el.duration,
  }));

export const MostTimeConsumingTestCasesTable = ({ widget: { content } }) => (
  <div className={cx('most-time-consuming-table')}>
    <TestsTableWidget
      tests={prepareWidgetData(content)}
      hideInfoBlock
      launch={content.latestLaunch}
      columns={cfg.columns}
    />
  </div>
);

MostTimeConsumingTestCasesTable.propTypes = {
  widget: PropTypes.object.isRequired,
};
