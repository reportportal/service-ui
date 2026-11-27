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
import { isEmpty } from 'es-toolkit/compat';

import { createClassnames } from 'common/utils';
import { ExpandedTextSection } from 'components/fields/expandedTextSection';
import { AttachmentsWithSlider } from 'pages/inside/common/attachmentsWithSlider';
import { commonMessages } from 'pages/inside/common/common-messages';
import { Scenario as TextScenario } from 'pages/inside/common/scenario';

import { FieldSection } from '../../../fieldSection';
import { ManualScenario, TestCaseManualScenario } from 'types/testCase';
import { messages } from './messages';
import { StepsList } from '../../stepsList';

import styles from './scenario.scss';

const cx = createClassnames(styles);

const COLLAPSED_TEXT_LINES = 5;

interface ScenarioProps {
  scenario: ManualScenario;
  /** Caption of the precondition and step attachments; "Attachments" by default. */
  attachmentsTitle?: string;
}

export const Scenario = ({ scenario, attachmentsTitle }: ScenarioProps) => {
  const { formatMessage } = useIntl();
  const attachmentsCaption = attachmentsTitle ?? formatMessage(commonMessages.attachments);
  const isStepsManualScenario = scenario.manualScenarioType === TestCaseManualScenario.STEPS;

  if (isStepsManualScenario) {
    const hasPreconditionAttachments = !isEmpty(scenario.preconditions?.attachments);
    const preconditionValue = scenario.preconditions?.value;
    const firstStep = scenario?.steps?.[0];

    return (
      <div className={cx('scenario-wrapper')}>
        {(preconditionValue || hasPreconditionAttachments) && (
          <div className={cx('scenario', 'steps-scenario', 'with-attachments')}>
            {preconditionValue && (
              <FieldSection title={formatMessage(messages.precondition)}>
                <ExpandedTextSection
                  text={preconditionValue}
                  defaultVisibleLines={COLLAPSED_TEXT_LINES}
                  isCompact
                />
              </FieldSection>
            )}
            {hasPreconditionAttachments && (
              <>
                {preconditionValue && <div className={cx('section-border')} />}
                <FieldSection
                  title={`${attachmentsCaption} ${scenario.preconditions?.attachments?.length}`}
                >
                  <AttachmentsWithSlider attachments={scenario.preconditions?.attachments} />
                </FieldSection>
              </>
            )}
          </div>
        )}
        <span className={cx('section-name')}>{formatMessage(messages.steps)}</span>
        {!firstStep?.expectedResult &&
        !firstStep?.instructions &&
        isEmpty(firstStep?.attachments) ? (
          <div className={cx('empty-section')}>{formatMessage(messages.noSteps)}</div>
        ) : (
          <StepsList steps={scenario.steps} attachmentsTitle={attachmentsTitle} />
        )}
      </div>
    );
  }

  return (
    <TextScenario
      precondition={scenario.preconditions?.value}
      instructions={scenario.instructions}
      expectedResult={scenario.expectedResult}
      isTextCollapsible
    />
  );
};
