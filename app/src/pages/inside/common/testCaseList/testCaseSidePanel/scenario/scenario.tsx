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
import { AttachmentList } from 'pages/inside/testCaseLibraryPage/attachmentList';
import { commonMessages } from 'pages/inside/common/common-messages';

import { FieldSection } from '../../../fieldSection';
import { ManualScenario } from 'pages/inside/testCaseLibraryPage/types';
import { messages } from './messages';
import { StepsList } from '../../stepsList';
import { TestCaseManualScenario } from 'pages/inside/common/testCaseList/types';

import styles from './scenario.scss';

const cx = createClassnames(styles);

interface ScenarioProps {
  scenario: ManualScenario;
}

export const Scenario = ({ scenario }: ScenarioProps) => {
  const { formatMessage } = useIntl();
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
                <div className={cx('precondition-text')}>{scenario.preconditions.value}</div>
              </FieldSection>
            )}
            {hasPreconditionAttachments && (
              <>
                {preconditionValue && <div className={cx('section-border')} />}
                <FieldSection
                  title={`${formatMessage(commonMessages.attachments)} ${scenario.preconditions.attachments?.length}`}
                >
                  <AttachmentList attachments={scenario.preconditions.attachments} />
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
          <StepsList steps={scenario.steps} />
        )}
      </div>
    );
  }

  return (
    <div className={cx('scenario-wrapper')}>
      <div className={cx('scenario', 'full-view')}>
        <FieldSection title={formatMessage(messages.precondition)} className={cx('sub-header')}>
          <div className={cx('precondition-text')}>{scenario.preconditions?.value}</div>
        </FieldSection>
        <FieldSection title={formatMessage(messages.instructions)} className={cx('sub-header')}>
          <div className={cx('precondition-text')}>{scenario.instructions}</div>
        </FieldSection>
        <FieldSection title={formatMessage(messages.expectedResult)} className={cx('sub-header')}>
          <div className={cx('precondition-text')}>{scenario.expectedResult}</div>
        </FieldSection>
      </div>
    </div>
  );
};
