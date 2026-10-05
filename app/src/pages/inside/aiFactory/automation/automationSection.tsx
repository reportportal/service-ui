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
import { Button } from '@reportportal/ui-kit';
import Link from 'redux-first-router-link';

import { createClassnames } from 'common/utils';
import { CollapsibleSection } from 'components/collapsibleSection';
import { PROJECT_PIPELINE_ITERATION_PAGE } from 'controllers/pages';
import { AutomationStatus, type AutomateAcceptedRS, type TestCaseAiRS } from 'types/aiFactory';

import { getAutomationSkipReason, type AutomationCandidate } from './automationUtils';
import { useAutomationModal } from './useAutomationModal';
import { automationDisabledMessages, messages } from './messages';
import styles from './automationSection.scss';

const cx = createClassnames(styles);

interface AutomationSectionProps {
  testCase: AutomationCandidate;
  automation?: TestCaseAiRS['automation'];
  canAutomate?: boolean;
  organizationSlug?: string;
  projectSlug?: string;
  onSuccess?: (response: AutomateAcceptedRS) => void;
}

export const AutomationSection = ({
  testCase,
  automation,
  canAutomate = true,
  organizationSlug,
  projectSlug,
  onSuccess,
}: AutomationSectionProps) => {
  const { formatMessage } = useIntl();
  const { openModal } = useAutomationModal();
  const disabledReason = getAutomationSkipReason(testCase);
  const runningIteration =
    automation?.status === AutomationStatus.IN_PROGRESS ? automation.iteration : undefined;

  return (
    <CollapsibleSection title={formatMessage(messages.sectionTitle)} isInitiallyExpanded>
      <div className={cx('automation-section')}>
        {runningIteration && (
          <output
            className={cx('automation-section__status')}
            data-automation-id="automationProgress"
          >
            <span>{formatMessage(messages.inProgress)}</span>
            <span aria-hidden="true"> · </span>
            {organizationSlug && projectSlug ? (
              <Link
                className={cx('automation-section__iteration-link')}
                data-automation-id="automationIterationLink"
                to={{
                  type: PROJECT_PIPELINE_ITERATION_PAGE,
                  payload: {
                    organizationSlug,
                    projectSlug,
                    pipelineId: runningIteration.pipelineId,
                    iterationId: runningIteration.iterationId,
                  },
                }}
              >
                {formatMessage(messages.iteration, { number: runningIteration.number })}
              </Link>
            ) : (
              <span>{formatMessage(messages.iteration, { number: runningIteration.number })}</span>
            )}
          </output>
        )}
        {canAutomate && (
          <Button
            variant="ghost"
            disabled={Boolean(disabledReason)}
            onClick={() => openModal({ testCases: [testCase], onSuccess })}
            data-automation-id="automateTestCase"
          >
            {formatMessage(messages.automate)}
          </Button>
        )}
        {canAutomate && disabledReason && (
          <p className={cx('automation-section__hint')}>
            {formatMessage(automationDisabledMessages[disabledReason])}
          </p>
        )}
      </div>
    </CollapsibleSection>
  );
};
