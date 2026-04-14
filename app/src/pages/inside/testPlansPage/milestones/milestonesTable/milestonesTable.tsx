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

import { useSelector } from 'react-redux';
import { Pagination } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import {
  defaultMilestoneQueryParams,
  MILESTONES_NAMESPACE,
  milestonesPageSelector,
  TmsMilestoneRS,
  TmsMilestoneStatus,
} from 'controllers/milestone';
import { useProjectDetails } from 'hooks/useTypedSelector';
import { TABLE_PAGE_SIZE_OPTIONS } from 'pages/inside/common/paginationConstants';
import { useURLBoundPagination } from 'pages/inside/common/testCaseList/useURLBoundPagination';
import { PageLoader } from '../../pageLoader';
import { MilestoneCard } from './milestoneCard';

import styles from './milestonesTable.scss';

const cx = createClassnames(styles);

interface MilestonesTableProps {
  milestones: TmsMilestoneRS[];
  isLoading: boolean;
  onEditMilestone?: (milestone: TmsMilestoneRS) => void;
  onDuplicateMilestone?: (milestone: TmsMilestoneRS) => void;
  onChangeMilestoneStatus?: (milestone: TmsMilestoneRS, targetStatus: TmsMilestoneStatus) => void;
}

export const MilestonesTable = ({
  milestones,
  isLoading,
  onEditMilestone,
  onDuplicateMilestone,
  onChangeMilestoneStatus,
}: MilestonesTableProps) => {
  const milestonesPageData = useSelector(milestonesPageSelector);
  const { organizationSlug, projectSlug } = useProjectDetails();
  const baseUrl = `/organizations/${organizationSlug}/projects/${projectSlug}/milestones`;

  const { setPageNumber, setPageSize, captions, activePage, pageSize, totalPages } =
    useURLBoundPagination({
      pageData: milestonesPageData,
      namespace: MILESTONES_NAMESPACE,
      shouldSaveUserPreferences: true,
      baseUrl,
      defaultQueryParams: defaultMilestoneQueryParams,
    });

  const showPagination = Boolean(milestonesPageData?.totalElements);

  return (
    <>
      <div
        className={cx('milestones-table', {
          'milestones-table_with-pagination': showPagination,
        })}
      >
        {isLoading ? (
          <PageLoader />
        ) : (
          milestones.map((milestone) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              onEditMilestone={onEditMilestone}
              onDuplicateMilestone={onDuplicateMilestone}
              onChangeMilestoneStatus={onChangeMilestoneStatus}
            />
          ))
        )}
      </div>
      {showPagination && (
        <div className={cx('milestones-table__pagination')}>
          <div className={cx('milestones-table__pagination-inner')}>
            <Pagination
              pageSize={pageSize}
              activePage={activePage}
              totalItems={milestonesPageData?.totalElements}
              totalPages={totalPages}
              pageSizeOptions={TABLE_PAGE_SIZE_OPTIONS}
              changePage={setPageNumber}
              changePageSize={setPageSize}
              captions={captions}
            />
          </div>
        </div>
      )}
    </>
  );
};
