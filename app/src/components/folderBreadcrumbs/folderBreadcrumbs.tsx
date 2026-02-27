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

import { ReactNode } from 'react';
import { isEmpty } from 'es-toolkit/compat';
import { useDispatch, useSelector } from 'react-redux';
import { Breadcrumbs, MoveToFolderIcon } from '@reportportal/ui-kit';

import { getParentFolders } from 'common/utils/folderUtils';
import { Folder } from 'controllers/testCase/types';
import {
  PROJECT_TEST_PLAN_DETAILS_PAGE,
  TEST_CASE_LIBRARY_PAGE,
  urlOrganizationSlugSelector,
  urlProjectSlugSelector,
} from 'controllers/pages';
import { TMS_INSTANCE_KEY } from 'pages/inside/common/constants';
import { createClassnames } from 'common/utils';
import { foldersSelector } from 'controllers/testCase';

import styles from './folderBreadcrumbs.scss';

const cx = createClassnames(styles);

export type FolderBreadcrumbItem = {
  id: number;
  name: string;
};

interface FolderBreadcrumbsProps {
  folderId: number | null | undefined;
  instanceKey: TMS_INSTANCE_KEY;
  testPlanId?: number;
}

interface BreadcrumbButtonLinkProps {
  to: string;
  children: ReactNode;
}

const amountToShowWithoutCollapsing = 4;
const amountToShowWhenCollapsing = 3;

const getPath = ({
  folderId,
  folders,
}: {
  folderId: number | null | undefined;
  folders: Folder[];
}) => {
  if (!folderId || isEmpty(folders)) {
    return [] as FolderBreadcrumbItem[];
  }

  return getParentFolders(folderId, folders)
    .reverse()
    .map((folder) => ({ id: folder.id, name: folder.name }));
};

export const FolderBreadcrumbs = ({
  folderId,
  instanceKey,
  testPlanId,
}: FolderBreadcrumbsProps) => {
  const dispatch = useDispatch();
  const organizationSlug = useSelector(urlOrganizationSlugSelector);
  const projectSlug = useSelector(urlProjectSlugSelector);
  const folders = useSelector(foldersSelector);

  const items = getPath({ folderId, folders });

  if (isEmpty(items)) {
    return null;
  }

  const handleFolderClick = (itemId: number) => {
    if (instanceKey === TMS_INSTANCE_KEY.TEST_PLAN) {
      if (!testPlanId) {
        return;
      }

      dispatch({
        type: PROJECT_TEST_PLAN_DETAILS_PAGE,
        payload: {
          organizationSlug,
          projectSlug,
          testPlanId,
          testPlanRoute: `folder/${itemId}`,
        },
      });

      return;
    }

    dispatch({
      type: TEST_CASE_LIBRARY_PAGE,
      payload: {
        organizationSlug,
        projectSlug,
        testCasePageRoute: `folder/${itemId}`,
      },
    });
  };

  const descriptors = items.map((item) => ({
    title: item.name,
    link: String(item.id),
  }));

  const BreadcrumbButtonLink = ({ to, children }: BreadcrumbButtonLinkProps) => (
    <button type="button" onClick={() => handleFolderClick(Number(to))}>
      {children}
    </button>
  );

  return (
    <div className={cx('folder-breadcrumbs')}>
      <MoveToFolderIcon />
      <Breadcrumbs
        descriptors={descriptors}
        LinkComponent={BreadcrumbButtonLink}
        maxShownDescriptors={
          descriptors.length === 4 ? amountToShowWithoutCollapsing : amountToShowWhenCollapsing
        }
        titleTailNumChars={0}
        isLastClickable
        className={cx('folder-breadcrumbs__container')}
      />
    </div>
  );
};
