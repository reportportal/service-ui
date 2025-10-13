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
import classNames from 'classnames/bind';
import { isEmpty } from 'es-toolkit/compat';
import { AttachmentList } from 'pages/inside/testCaseLibraryPage/attachmentList';

import { IScenario } from '../../../types';
import { FieldSection } from '../../../fieldSection';
import { messages } from './messages';
import { StepsList } from '../../../createTestCaseModal/stepsList';
import { TestCaseManualScenario } from 'pages/inside/testCaseLibraryPage/testCaseList/types';
import styles from './scenario.scss';

const cx = classNames.bind(styles) as typeof classNames;

interface ScenarioProps {
  scenario: IScenario;
}

export const Scenario = ({ scenario }: ScenarioProps) => {
  const { formatMessage } = useIntl();
  const isStepsManualScenario = scenario.manualScenarioType === TestCaseManualScenario.STEPS;

  if (isStepsManualScenario) {
    const isPreconditionAttachments = !isEmpty(scenario.preconditions?.attachments);

    return (
      <div className={cx('scenario-wrapper')}>
        <div className={cx('scenario', 'steps-scenario', 'with-attachments')}>
          <FieldSection title={formatMessage(messages.precondition)}>
            <div className={cx('precondition-text')}>{scenario.preconditions?.value}</div>
          </FieldSection>
          {isPreconditionAttachments ? (
            <>
              <div className={cx('section-border')} />
              <FieldSection
                title={`${formatMessage(messages.attachments)} ${scenario.preconditions.attachments?.length}`}
              >
                <AttachmentList attachments={scenario.preconditions.attachments} />
              </FieldSection>
            </>
          ) : null}
        </div>
        <span className={cx('section-name')}>Steps</span>
        {isEmpty(scenario?.steps) ? (
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
        <FieldSection title={formatMessage(messages.precondition)}>
          <div className={cx('precondition-text')}>{scenario.preconditions?.value}</div>
        </FieldSection>
        <FieldSection title={formatMessage(messages.instructions)}>
          <div className={cx('precondition-text')}>{scenario.instructions}</div>
        </FieldSection>
        <FieldSection title={formatMessage(messages.expectedResult)}>
          <div className={cx('precondition-text')}>{scenario.expectedResult}</div>
        </FieldSection>
      </div>
    </div>
  );
};
