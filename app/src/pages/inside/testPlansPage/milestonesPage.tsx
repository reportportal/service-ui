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
import { isNotNil, isUndefined } from 'es-toolkit';
import { isEmpty } from 'es-toolkit/compat';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useMemo, useRef } from 'react';
import { useTracking } from 'react-tracking';
import { Button, RefreshIcon } from '@reportportal/ui-kit';

import { MILESTONES_PAGE_EVENTS, MILESTONES_PAGE_VIEW_TYPE } from 'analyticsEvents/milestonesPageEvents';

import { SettingsLayout } from 'layouts/settingsLayout';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { PreservedText } from 'components/preservedText';
import { ProjectDetails } from 'pages/organization/constants';
import { projectNameSelector } from 'controllers/project';
import { PROJECT_DASHBOARD_PAGE, urlOrganizationAndProjectSelector } from 'controllers/pages';
import {
  getMilestonesAction,
  milestonesSelector,
  milestonesLoadingSelector,
  defaultMilestoneQueryParams,
  TmsMilestoneRS,
  MilestoneStatus,
} from 'controllers/milestone';
import { useUserPermissions } from 'hooks/useUserPermissions';
import { useQueryParams } from 'common/hooks';
import { isAuthorizedSelector } from 'controllers/auth';

import {
  EmptyMilestones,
  MilestonesTable,
  useChangeMilestoneStatusModal,
  useCreateMilestoneModal,
  useDeleteMilestoneModal,
  useDuplicateMilestoneModal,
  useEditMilestoneModal,
} from './milestones';
import { PageHeaderWithBreadcrumbsAndActions } from '../common/pageHeaderWithBreadcrumbsAndActions';
import { commonMessages } from './commonMessages';

export const MilestonesPage = () => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { trackEvent } = useTracking();
  const { openModal: openMilestoneModal } = useCreateMilestoneModal();
  const { openModal: openEditMilestoneModal } = useEditMilestoneModal();
  const { openModal: openDuplicateMilestoneModal } = useDuplicateMilestoneModal();
  const { openModal: openChangeMilestoneStatusModal } = useChangeMilestoneStatusModal();
  const { openModal: openDeleteMilestoneModal } = useDeleteMilestoneModal();
  const projectName = useSelector(projectNameSelector);
  const { canManageTestPlans } = useUserPermissions();
  const { organizationSlug, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  ) as ProjectDetails;
  const milestones = useSelector(milestonesSelector);
  const milestonesLoading = useSelector(milestonesLoadingSelector);
  const isAuthorized = useSelector(isAuthorizedSelector);
  const projectLink = { type: PROJECT_DASHBOARD_PAGE, payload: { organizationSlug, projectSlug } };
  const breadcrumbDescriptors = [
    { id: 'project', title: <PreservedText>{projectName}</PreservedText>, link: projectLink },
  ];
  const { offset, limit } = useQueryParams(defaultMilestoneQueryParams);
  const queryParams = useMemo(() => ({ offset, limit }), [offset, limit]);

  useEffect(() => {
    if (isUndefined(milestones) && !milestonesLoading && isAuthorized) {
      dispatch(getMilestonesAction(queryParams));
    }
  }, [dispatch, milestones, milestonesLoading, queryParams, isAuthorized]);

  const hasTrackedViewRef = useRef(false);

  useEffect(() => {
    if (hasTrackedViewRef.current || milestonesLoading || !isNotNil(milestones)) {
      return;
    }
    hasTrackedViewRef.current = true;
    trackEvent(
      MILESTONES_PAGE_EVENTS.viewMilestonesPage(
        isEmpty(milestones) ? MILESTONES_PAGE_VIEW_TYPE.EMPTY : MILESTONES_PAGE_VIEW_TYPE.POPULATED,
      ),
    );
  }, [milestones, milestonesLoading, trackEvent]);

  const handleCreateMilestone = () => {
    trackEvent(MILESTONES_PAGE_EVENTS.CLICK_CREATE_MILESTONE);
    openMilestoneModal();
  };

  const renderContent = () => {
    if ((isNotNil(milestones) && !isEmpty(milestones)) || milestonesLoading) {
      return (
        <MilestonesTable
          milestones={milestones ?? []}
          isLoading={milestonesLoading}
          onEditMilestone={canManageTestPlans ? openEditMilestoneModal : undefined}
          onDuplicateMilestone={canManageTestPlans ? openDuplicateMilestoneModal : undefined}
          onDeleteMilestone={canManageTestPlans ? openDeleteMilestoneModal : undefined}
          onChangeMilestoneStatus={
            canManageTestPlans
              ? (milestone: TmsMilestoneRS, targetStatus: MilestoneStatus) =>
                  openChangeMilestoneStatusModal({ milestone, targetStatus })
              : undefined
          }
        />
      );
    }

    return (
      <EmptyMilestones onCreateMilestone={canManageTestPlans ? handleCreateMilestone : undefined} />
    );
  };

  const loading = milestonesLoading;

  return (
    <SettingsLayout>
      <ScrollWrapper resetRequired>
        <PageHeaderWithBreadcrumbsAndActions
          title={formatMessage(commonMessages.pageTitle)}
          breadcrumbDescriptors={breadcrumbDescriptors}
          actions={
            <>
              <Button
                variant="text"
                data-automation-id="refreshPageButton"
                icon={<RefreshIcon />}
                disabled={loading || !isAuthorized}
                onClick={() => isAuthorized && dispatch(getMilestonesAction(queryParams))}
              >
                {formatMessage(commonMessages.refreshPage)}
              </Button>
              {canManageTestPlans && (
                <Button
                  variant="ghost"
                  data-automation-id="createMilestoneButton"
                  onClick={handleCreateMilestone}
                >
                  {formatMessage(commonMessages.createMilestone)}
                </Button>
              )}
            </>
          }
        />
        {renderContent()}
      </ScrollWrapper>
    </SettingsLayout>
  );
};
