/*
 * Copyright 2026 EPAM Systems
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
import { isEmpty } from 'es-toolkit/compat';
import { FilterOutlineIcon } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { SettingsLayout } from 'layouts/settingsLayout';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { SearchField } from 'components/fields/searchField';
import { PageHeaderWithBreadcrumbsAndActions } from 'pages/inside/common/pageHeaderWithBreadcrumbsAndActions';
import { PageLoader } from 'pages/inside/testPlansPage/pageLoader';
import { MANUAL_LAUNCHES_PAGE, MANUAL_LAUNCH_DETAILS_PAGE } from 'controllers/pages';
import {
  activeManualLaunchExecutionSelector,
  isLoadingActiveManualLaunchExecutionSelector,
  activeManualLaunchSelector,
  MANUAL_SCENARIO_TYPE_TEXT,
} from 'controllers/manualLaunch';
import { useProjectDetails, useManualLaunchId } from 'hooks/useTypedSelector';

import { ExecutionStatusButtons } from './executionStatusButtons';
import { TextBasedContent } from './textBasedContent';
import { StepsBasedContent } from './stepsBasedContent';
import { messages } from './messages';
import { commonMessages } from 'pages/inside/common/common-messages';
import { messages as manualLaunchesMessages } from '../messages';

import styles from './manualLaunchExecutionPage.scss';

const cx = createClassnames(styles);

export const ManualLaunchExecutionPage = () => {
  const { formatMessage } = useIntl();
  const { organizationSlug, projectSlug } = useProjectDetails();
  const launchId = useManualLaunchId();
  const launch = useSelector(activeManualLaunchSelector);
  const execution = useSelector(activeManualLaunchExecutionSelector);
  const isLoading = useSelector(isLoadingActiveManualLaunchExecutionSelector);

  const launchName = launch?.name ?? '';

  const breadcrumbDescriptors = [
    {
      id: 'manualLaunches',
      title: formatMessage(manualLaunchesMessages.manualLaunchesTitle),
      link: {
        type: MANUAL_LAUNCHES_PAGE,
        payload: { organizationSlug, projectSlug },
      },
    },
    {
      id: 'launch',
      title: launchName || formatMessage(commonMessages.scenario),
      link: launchId
        ? {
            type: MANUAL_LAUNCH_DETAILS_PAGE,
            payload: { organizationSlug, projectSlug, launchId },
          }
        : undefined,
    },
    {
      id: 'execution',
      title: execution?.testCaseName ?? '',
    },
  ];

  const handleFilterClick = () => {
    // TODO: Implement filter functionality
  };

  const isTextBased = execution?.manualScenario?.manualScenarioType === MANUAL_SCENARIO_TYPE_TEXT;

  const renderHeaderActions = () => (
    <div className={cx('header-actions')}>
      <div className={cx('search-filter')}>
        <SearchField
          searchValue=""
          setSearchValue={() => {}}
          onFilterChange={() => {}}
          placeholder={formatMessage(messages.searchPlaceholder)}
          isLoading={false}
        />
        <button
          type="button"
          className={cx('filter-button')}
          onClick={handleFilterClick}
          aria-label={formatMessage(messages.filterAriaLabel)}
        >
          <FilterOutlineIcon />
        </button>
      </div>
      <ExecutionStatusButtons />
    </div>
  );

  if (isLoading) {
    return (
      <SettingsLayout>
        <PageLoader />
      </SettingsLayout>
    );
  }

  if (!execution || isEmpty(execution)) {
    return (
      <SettingsLayout>
        <ScrollWrapper resetRequired>
          <div
            className={cx('manual-launch-execution-page', 'manual-launch-execution-page--empty')}
          >
            <div className={cx('manual-launch-execution-page__header')}>
              <PageHeaderWithBreadcrumbsAndActions
                title=""
                breadcrumbDescriptors={breadcrumbDescriptors}
              />
            </div>
            <div className={cx('empty-message')}>{formatMessage(messages.executionNotFound)}</div>
          </div>
        </ScrollWrapper>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout>
      <ScrollWrapper resetRequired>
        <div className={cx('manual-launch-execution-page')}>
          <div className={cx('manual-launch-execution-page__header')}>
            <PageHeaderWithBreadcrumbsAndActions
              title={execution.testCaseName}
              breadcrumbDescriptors={breadcrumbDescriptors}
              actions={renderHeaderActions()}
            />
          </div>
          <div className={cx('manual-launch-execution-page__content')}>
            {isTextBased ? (
              <TextBasedContent execution={execution} />
            ) : (
              <StepsBasedContent execution={execution} />
            )}
          </div>
        </div>
      </ScrollWrapper>
    </SettingsLayout>
  );
};
