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
import Link from 'redux-first-router-link';

import { createClassnames } from 'common/utils';
import { TEST_CASE_LIBRARY_PAGE, urlOrganizationAndProjectSelector } from 'controllers/pages';
import { ProjectDetails } from 'pages/organization/constants';

import styles from './stagePanels.scss';

const cx = createClassnames(styles);

export interface CaseLinkProps {
  testCaseId?: number;
  name: string;
}

/** A case's name, linked to its Library details page when it already has an id (02 §"Case title links"). */
export const CaseLink = ({ testCaseId, name }: CaseLinkProps) => {
  const { organizationSlug, projectSlug } = useSelector(
    urlOrganizationAndProjectSelector,
  ) as ProjectDetails;

  if (testCaseId === undefined) {
    return <span>{name}</span>;
  }

  return (
    <Link
      className={cx('caseLink')}
      to={{
        type: TEST_CASE_LIBRARY_PAGE,
        payload: { organizationSlug, projectSlug, testCasePageRoute: `test-cases/${testCaseId}` },
      }}
    >
      {name}
    </Link>
  );
};
