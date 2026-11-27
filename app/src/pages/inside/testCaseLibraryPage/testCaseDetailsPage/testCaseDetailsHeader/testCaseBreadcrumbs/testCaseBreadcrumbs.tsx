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
import { useDispatch, useSelector } from 'react-redux';
import { Breadcrumbs, BreadcrumbsTreeIcon, MeatballMenuIcon } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { NavLink } from 'components/main/navLink';
import { TEST_CASE_LIBRARY_PAGE, urlOrganizationAndProjectSelector } from 'controllers/pages';
import { foldersSelector } from 'controllers/testCase';
import { ProjectDetails } from 'pages/organization/constants';
import { PopoverControl } from 'pages/common/popoverControl';

import { commonMessages } from '../../../commonMessages';
import { FolderCrumb, getFolderPath, splitFolderPath } from './utils';

import styles from './testCaseBreadcrumbs.scss';

const cx = createClassnames(styles);

interface TestCaseBreadcrumbsProps {
  className?: string;
  testCaseName: string;
  folderId: number | null | undefined;
}

export const TestCaseBreadcrumbs = ({
  className,
  testCaseName,
  folderId,
}: TestCaseBreadcrumbsProps) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { organizationSlug, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  ) as ProjectDetails;
  const folders = useSelector(foldersSelector);

  const folderPath = getFolderPath(folderId, folders);
  const { hiddenFolders, shownFolders } = splitFolderPath(folderPath);
  // ui-kit Breadcrumb keeps its overflow title in state and never clears it,
  // so the crumbs are re-mounted when the path or the name changes
  const breadcrumbsKey = [...folderPath.map(({ id, name }) => `${id}:${name}`), testCaseName].join(
    '/',
  );

  const getFolderLink = (id: number) => ({
    type: TEST_CASE_LIBRARY_PAGE,
    payload: { organizationSlug, projectSlug, testCasePageRoute: `folder/${id}` },
  });

  const getFolderDescriptor = ({ id, name }: FolderCrumb) => ({
    title: name,
    link: getFolderLink(id),
    className: cx('test-case-breadcrumbs__folder'),
  });

  const hiddenFoldersDescriptor = {
    title: (
      <PopoverControl
        items={hiddenFolders.map(({ id, name }) => ({
          label: name,
          onClick: () => dispatch(getFolderLink(id)),
        }))}
        placement="bottom"
        shouldUsePortal
        isCompact
      >
        <button
          type="button"
          className={cx('test-case-breadcrumbs__hidden-trigger')}
          aria-label={hiddenFolders.map(({ name }) => name).join(' / ')}
        >
          <MeatballMenuIcon />
        </button>
      </PopoverControl>
    ),
    className: cx('test-case-breadcrumbs__hidden'),
  };

  const descriptors = [
    {
      title: formatMessage(commonMessages.testCaseLibraryBreadcrumb),
      link: { type: TEST_CASE_LIBRARY_PAGE, payload: { organizationSlug, projectSlug } },
    },
    ...(hiddenFolders.length ? [hiddenFoldersDescriptor] : []),
    ...shownFolders.map(getFolderDescriptor),
    { title: testCaseName },
  ];

  return (
    <div className={cx('test-case-breadcrumbs', className)}>
      <BreadcrumbsTreeIcon />
      <Breadcrumbs
        key={breadcrumbsKey}
        descriptors={descriptors}
        LinkComponent={NavLink}
        // the collapse into "⋯" is done above: first crumb › ⋯ › three nearest folders › test case
        maxShownDescriptors={descriptors.length}
        titleTailNumChars={0}
        className={cx('test-case-breadcrumbs__container')}
      />
    </div>
  );
};
