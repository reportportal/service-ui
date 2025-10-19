/*
 * Copyright 2025 EPAM Systems
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

import React, { useEffect, useState } from 'react';
import classNames from 'classnames/bind';
import { useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { projectNameSelector } from 'controllers/project';
import { activeOrganizationNameSelector } from 'controllers/organization';
import { LocationHeaderLayout } from 'layouts/locationHeaderLayout';
import { messages } from './messages';
import styles from './manualLaunchesPage.scss';
import { ManualLaunchesPageContent } from './manualLaunchesPageContent';

const cx = classNames.bind(styles);

// Temp mock data, remove after integration 1/4
const mockData = [
  {
    id: 1,
    count: 20,
    name: 'Regression Product Build',
    startTime: 1758515600000,
    totalTests: 1000,
    successTests: 750,
    failedTests: 200,
    skippedTests: 50,
    testsToRun: 129,
  },
  {
    id: 2,
    count: 1,
    name: 'API Test Pack Main',
    startTime: 1752315200000,
    totalTests: 1000,
    successTests: 5,
    failedTests: 995,
    skippedTests: 0,
    testsToRun: 32342,
  },
  {
    id: 3,
    count: 334,
    name: 'Test Pack Service UI main app',
    startTime: 1758913600000,
    totalTests: 1000,
    successTests: 850,
    failedTests: 150,
    skippedTests: 0,
    testsToRun: 0,
  },
];

export const ManualLaunchesPage = () => {
  const [isDataLoading, setIsDataLoading] = useState(true); //fake loading state, remove after integration 2/4
  const [data, setData] = useState([]); //state with fake data, remove after integration 3/4

  const { formatMessage } = useIntl();
  const projectName = useSelector(projectNameSelector);
  const organizationName = useSelector(activeOrganizationNameSelector);

  // Simulate data loading, remove after integration 4/4
  useEffect(() => {
    setTimeout(() => {
      setData(mockData);
      setIsDataLoading(false);
    }, 2000);
  }, []);

  return (
    <div className={cx('manual-launches-page')}>
      <LocationHeaderLayout
        title={formatMessage(messages.manualLaunchesTitle)}
        organizationName={organizationName}
        projectName={projectName}
      />
      <ManualLaunchesPageContent data={data} isLoading={isDataLoading} />
    </div>
  );
};
