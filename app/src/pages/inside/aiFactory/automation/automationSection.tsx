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

import { createClassnames } from 'common/utils';
import { CollapsibleSection } from 'components/collapsibleSection';
import type { AutomateAcceptedRS } from 'types/aiFactory';

import { getAutomationSkipReason, type AutomationCandidate } from './automationUtils';
import { useAutomationModal } from './useAutomationModal';
import { automationDisabledMessages, messages } from './messages';
import styles from './automationSection.scss';

const cx = createClassnames(styles);

interface AutomationSectionProps {
  testCase: AutomationCandidate;
  onSuccess?: (response: AutomateAcceptedRS) => void;
}

export const AutomationSection = ({ testCase, onSuccess }: AutomationSectionProps) => {
  const { formatMessage } = useIntl();
  const { openModal } = useAutomationModal();
  const disabledReason = getAutomationSkipReason(testCase);

  return (
    <CollapsibleSection title={formatMessage(messages.sectionTitle)} isInitiallyExpanded>
      <div className={cx('automation-section')}>
        <Button
          variant="ghost"
          disabled={Boolean(disabledReason)}
          onClick={() => openModal({ testCases: [testCase], onSuccess })}
          data-automation-id="automateTestCase"
        >
          {formatMessage(messages.automate)}
        </Button>
        {disabledReason && (
          <p className={cx('automation-section__hint')}>
            {formatMessage(automationDisabledMessages[disabledReason])}
          </p>
        )}
      </div>
    </CollapsibleSection>
  );
};
