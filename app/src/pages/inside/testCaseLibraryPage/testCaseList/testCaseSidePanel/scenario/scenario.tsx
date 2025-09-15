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
import { AttachedFile } from '@reportportal/ui-kit';
import { isEmpty } from 'lodash';

import { ExpandedTextSection } from 'components/fields/expandedTextSection';
import { IScenario } from '../../../types';
import { FieldSection } from './fieldSection';
import { messages } from './messages';

import styles from './scenario.scss';

const cx = classNames.bind(styles) as typeof classNames;

interface ScenarioProps {
  scenario: IScenario;
}

export const Scenario = ({ scenario }: ScenarioProps) => {
  const { formatMessage } = useIntl();

  const hasInstructions = !isEmpty(scenario.instruction);
  const hasExpectedResult = !isEmpty(scenario.expectedResult);
  const hasAttachments = !isEmpty(scenario.attachments);

  if (hasInstructions && hasExpectedResult) {
    return (
      <div className={cx('scenario', 'full-view')}>
        <FieldSection title={formatMessage(messages.precondition)} variant="full-view">
          <ExpandedTextSection text={scenario.precondition} />
        </FieldSection>
        <FieldSection title={formatMessage(messages.instructions)} variant="full-view">
          <ExpandedTextSection text={scenario.instruction} />
        </FieldSection>
        <FieldSection title={formatMessage(messages.expectedResult)} variant="full-view">
          <ExpandedTextSection text={scenario.expectedResult} />
        </FieldSection>
      </div>
    );
  }
  if (hasAttachments) {
    return (
      <div className={cx('scenario', 'with-attachments')}>
        <FieldSection title={formatMessage(messages.precondition)}>
          <div className={cx('precondition-text')}>{scenario.precondition}</div>
        </FieldSection>
        <div className={cx('section-border')} />
        <FieldSection
          title={`${formatMessage(messages.attachments)} ${scenario.attachments.length}`}
        >
          <div className={cx('attachments-list')}>
            {scenario.attachments.map((attachment) => (
              <AttachedFile
                key={attachment.fileName}
                fileName={attachment.fileName}
                size={attachment.size}
                isFullWidth
              />
            ))}
          </div>
        </FieldSection>
      </div>
    );
  }
  return (
    <div className={cx('scenario', 'simple-view')}>
      <FieldSection title={formatMessage(messages.precondition)}>
        <div className={cx('precondition-text')}>{scenario.precondition}</div>
      </FieldSection>
    </div>
  );
};
