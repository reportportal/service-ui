/*
 * Copyright 2026 EPAM Systems
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */

import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import Link from 'redux-first-router-link';

import { createClassnames } from 'common/utils';
import { useAiFactoryEnabled } from 'controllers/aiFactory';
import {
  PROJECT_PIPELINE_ITERATION_PAGE,
  TEST_CASE_LIBRARY_PAGE,
  urlOrganizationAndProjectSelector,
} from 'controllers/pages';
import type { ProjectDetails } from 'pages/organization/constants';

import { parsePipelineIterationIdentity, parseTestCaseIdentity } from './backlinkUtils';
import { messages } from './messages';
import styles from './aiFactoryBacklink.scss';

const cx = createClassnames(styles);

interface TestItemBacklinkProps {
  host: 'testItem';
  placement?: 'details' | 'inline';
  testCase?: unknown;
}

interface LaunchRootBacklinkProps {
  attributes?: unknown;
  host: 'launchRoot';
}

export type AiFactoryBacklinkProps = TestItemBacklinkProps | LaunchRootBacklinkProps;

export const AiFactoryBacklink = (props: AiFactoryBacklinkProps) => {
  const { formatMessage } = useIntl();
  const isAiFactoryEnabled = useAiFactoryEnabled();
  const routeContext = useSelector(urlOrganizationAndProjectSelector) as Partial<ProjectDetails>;
  const organizationSlug = routeContext?.organizationSlug;
  const projectSlug = routeContext?.projectSlug;

  if (
    !isAiFactoryEnabled ||
    typeof organizationSlug !== 'string' ||
    !organizationSlug.trim().length ||
    typeof projectSlug !== 'string' ||
    !projectSlug.trim().length
  ) {
    return null;
  }

  if (props.host === 'testItem') {
    const testCase = parseTestCaseIdentity(props.testCase);
    if (!testCase) {
      return null;
    }

    return (
      <Link
        className={cx('ai-factory-backlink', 'ai-factory-backlink--test-item', {
          'ai-factory-backlink--details': props.placement === 'details',
        })}
        data-automation-id="library-test-case-backlink"
        to={{
          type: TEST_CASE_LIBRARY_PAGE,
          payload: {
            organizationSlug,
            projectSlug,
            testCasePageRoute: `test-cases/${testCase.id}`,
          },
        }}
      >
        {formatMessage(messages.libraryTestCase)}
      </Link>
    );
  }

  const iteration = parsePipelineIterationIdentity(props.attributes);
  if (!iteration) {
    return null;
  }

  return (
    <Link
      className={cx('ai-factory-backlink', 'ai-factory-backlink--launch-root')}
      data-automation-id="automation-iteration-backlink"
      to={{
        type: PROJECT_PIPELINE_ITERATION_PAGE,
        payload: { organizationSlug, projectSlug, ...iteration },
      }}
    >
      {formatMessage(messages.automationIteration)}
    </Link>
  );
};
