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

import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';

import { projectNameSelector } from 'controllers/project';
import { activeOrganizationNameSelector } from 'controllers/organization';
import { LocationHeaderLayout } from 'layouts/locationHeaderLayout';
import { createClassnames } from 'common/utils';

import { messages } from './messages';
import styles from './manualLaunchesPage.scss';
import { ManualLaunchesPageContent } from './manualLaunchesPageContent';
import { useManualLaunches } from './useManualLaunches';

const cx = createClassnames(styles);

export const ManualLaunchesPage = () => {
  const { formatMessage } = useIntl();
  const projectName = useSelector(projectNameSelector);
  const organizationName = useSelector(activeOrganizationNameSelector) as string;
  const { launches, isLoading } = useManualLaunches();

  return (
    <div className={cx('manual-launches-page')}>
      <LocationHeaderLayout
        title={formatMessage(messages.manualLaunchesTitle)}
        organizationName={organizationName}
        projectName={projectName}
      />
      <ManualLaunchesPageContent data={launches} isLoading={isLoading} />
    </div>
  );
};
