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
import { ExpandedTextSection } from 'components/fields/expandedTextSection';
import isEmpty from 'lodash.isempty';
import { IScenario } from '../../../types';
import { AttachmentItem } from '../../../../../../componentLibrary/attachmentItem';
import { messages } from './messages';
import styles from './scenario.scss';

const cx = classNames.bind(styles);

interface ScenarioProps {
  scenario: IScenario;
}

export const Scenario = ({ scenario }: ScenarioProps) => {
  const { formatMessage } = useIntl();

  const hasInstructions = !isEmpty(scenario.instruction);
  const hasExpectedResult = !isEmpty(scenario.expectedResult);
  const hasAttachments = !isEmpty(scenario.attachments);

  // View 3: All three fields exist
  if (hasInstructions && hasExpectedResult) {
    return (
      <div className={cx('scenario', 'full-view')}>
        <div className={cx('field-section')}>
          <h4 className={cx('field-title')}>{formatMessage(messages.precondition)}</h4>
          <ExpandedTextSection text={scenario.precondition} />
        </div>
        <div className={cx('field-section')}>
          <h4 className={cx('field-title')}>{formatMessage(messages.instructions)}</h4>
          <ExpandedTextSection text={scenario.instruction} />
        </div>
        <div className={cx('field-section')}>
          <h4 className={cx('field-title')}>{formatMessage(messages.expectedResult)}</h4>
          <ExpandedTextSection text={scenario.expectedResult} />
        </div>
      </div>
    );
  }
  // View 2: Precondition + Attachments
  if (hasAttachments) {
    return (
      <div className={cx('scenario', 'with-attachments')}>
        <div className={cx('field-section')}>
          <h4 className={cx('field-title')}>{formatMessage(messages.precondition)}</h4>
          <div className={cx('precondition-text')}>{scenario.precondition}</div>
        </div>
        <div className={cx('section-border')} />
        <div className={cx('field-section')}>
          <h4 className={cx('field-title')}>
            {formatMessage(messages.attachments)} {scenario.attachments.length}
          </h4>
          <div className={cx('attachments-list')}>
            {scenario.attachments.map((attachment) => (
              <AttachmentItem
                key={attachment.fileName}
                fileName={attachment.fileName}
                size={attachment.size}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
  // View 1: Only precondition
  return (
    <div className={cx('scenario', 'simple-view')}>
      <div className={cx('field-section')}>
        <h4 className={cx('field-title')}>{formatMessage(messages.precondition)}</h4>
        <div className={cx('precondition-text')}>{scenario.precondition}</div>
      </div>
    </div>
  );
};
