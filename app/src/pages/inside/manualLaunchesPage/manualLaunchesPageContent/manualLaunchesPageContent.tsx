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

import { isEmpty } from 'es-toolkit/compat';
import { BubblesLoader } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';

import { ManualLaunchesEmptyState } from '../emptyState/manualLaunchesEmptyState';
import { ManualLaunchesList } from '../manualLaunchesList';
import { ManualTestCase, Launch } from '../types';

import styles from '../manualLaunchesPage.scss';

const cx = createClassnames(styles);

export interface ManualLaunchesPageContentProps {
  isLoading: boolean;
  data?: ManualTestCase[];
  fullLaunches?: Launch[];
}

export const ManualLaunchesPageContent = ({
  isLoading,
  data = [],
  fullLaunches = [],
}: ManualLaunchesPageContentProps) => {
  if (isLoading) {
    return (
      <div className={cx('loading')}>
        <BubblesLoader />
      </div>
    );
  }

  if (isEmpty(data)) {
    return <ManualLaunchesEmptyState />;
  }

  return <ManualLaunchesList data={data} fullLaunches={fullLaunches} />;
};
