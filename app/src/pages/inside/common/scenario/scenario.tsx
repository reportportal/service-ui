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

import { MessageDescriptor, useIntl } from 'react-intl';

import { createClassnames } from 'common/utils';
import { ExpandedTextSection } from 'components/fields/expandedTextSection';
import { EMPTY_FIELD_VALUE } from 'pages/inside/common/constants';
import { messages } from 'pages/inside/common/testCaseList/testCaseSidePanel/scenario/messages';

import styles from './scenario.scss';

const cx = createClassnames(styles);

const COLLAPSED_TEXT_LINES = 5;

interface ScenarioProps {
  precondition?: string;
  instructions?: string;
  expectedResult?: string;
  isTextCollapsible?: boolean;
  hasSecondaryLabels?: boolean;
}

export const Scenario = ({
  precondition,
  instructions,
  expectedResult,
  isTextCollapsible = false,
  hasSecondaryLabels = false,
}: ScenarioProps) => {
  const { formatMessage } = useIntl();

  const renderField = (header: MessageDescriptor, value?: string) => (
    <>
      <h4 className={cx('scenario__label', { 'scenario__label--secondary': hasSecondaryLabels })}>
        {formatMessage(header)}
      </h4>
      {value && isTextCollapsible ? (
        <ExpandedTextSection text={value} defaultVisibleLines={COLLAPSED_TEXT_LINES} isCompact />
      ) : (
        <p className={cx('scenario__value')}>{value || EMPTY_FIELD_VALUE}</p>
      )}
    </>
  );

  return (
    <section className={cx('scenario')}>
      <div className={cx('scenario__card', 'scenario__field')}>
        {renderField(messages.precondition, precondition)}
      </div>
      <div className={cx('scenario__card', 'scenario__columns')}>
        <div className={cx('scenario__field', 'scenario__field--divided')}>
          {renderField(messages.instructions, instructions)}
        </div>
        <div className={cx('scenario__field')}>
          {renderField(messages.expectedResult, expectedResult)}
        </div>
      </div>
    </section>
  );
};
