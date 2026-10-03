/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Fragment } from 'react';
import { useIntl } from 'react-intl';
import Link from 'redux-first-router-link';
import { Button, SystemMessage, Tooltip } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { TEST_CASE_LIBRARY_PAGE } from 'controllers/pages';
import { useProjectDetails } from 'hooks/useTypedSelector';

import { messages } from './messages';

import styles from './testPlanLaunchGuard.scss';

const cx = createClassnames(styles);

interface TestPlanLaunchGuardProps {
  draftCount: number;
  isBlocked: boolean;
}

export interface TestPlanLaunchBlockedBannerProps extends TestPlanLaunchGuardProps {
  draftTestCases: { id: number; displayId: string }[];
}

export const TestPlanLaunchBlockedBanner = ({
  draftCount,
  draftTestCases,
  isBlocked,
}: TestPlanLaunchBlockedBannerProps) => {
  const { formatMessage } = useIntl();
  const { organizationSlug, projectSlug } = useProjectDetails();

  if (!isBlocked) {
    return null;
  }

  return (
    <SystemMessage mode="warning">
      <span>{formatMessage(messages.testPlanLaunchBlocked, { count: draftCount })}</span>
      {draftTestCases.length > 0 && (
        <span>
          {' — '}
          {draftTestCases.map((testCase, index) => (
            <Fragment key={testCase.id}>
              {index > 0 && ', '}
              <Link
                className={cx('draft-link')}
                to={{
                  type: TEST_CASE_LIBRARY_PAGE,
                  payload: {
                    organizationSlug,
                    projectSlug,
                    testCasePageRoute: `test-cases/${testCase.id}`,
                  },
                }}
              >
                {testCase.displayId}
              </Link>
            </Fragment>
          ))}
        </span>
      )}
    </SystemMessage>
  );
};

export interface TestPlanLaunchButtonProps extends TestPlanLaunchGuardProps {
  label: string;
  onClick: () => void;
}

export const TestPlanLaunchButton = ({
  draftCount,
  isBlocked,
  label,
  onClick,
}: TestPlanLaunchButtonProps) => {
  const { formatMessage } = useIntl();
  const button = (
    <Button
      variant="primary"
      data-automation-id="createLaunchButton"
      disabled={isBlocked}
      onClick={onClick}
    >
      {label}
    </Button>
  );

  return isBlocked ? (
    <Tooltip
      placement="bottom"
      content={formatMessage(messages.testPlanLaunchBlocked, { count: draftCount })}
    >
      {button}
    </Tooltip>
  ) : (
    button
  );
};
