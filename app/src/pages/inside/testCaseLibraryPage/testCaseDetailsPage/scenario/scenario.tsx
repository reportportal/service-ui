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
import { commonMessages } from 'pages/inside/common/common-messages';

import styles from './scenario.scss';

const cx = createClassnames(styles);

interface ScenarioProps {
  precondition?: string;
  instructions?: string;
  expectedResult?: string;
}

export const Scenario = ({ precondition, instructions, expectedResult }: ScenarioProps) => {
  const { formatMessage } = useIntl();
  const getSubScenario = ({ header, value }: { header: MessageDescriptor; value: string }) =>
    value ? (
      <div className={cx('scenario__section')}>
        <h4 className={cx('scenario__section-header')}>{formatMessage(header)}</h4>
        <p className={cx('scenario__section-value')}>{value}</p>
      </div>
    ) : null;

  return (
    <section className={cx('scenario')}>
      {getSubScenario({
        header: commonMessages.precondition,
        value: precondition,
      })}
      {getSubScenario({
        header: commonMessages.instructions,
        value: instructions,
      })}
      {getSubScenario({
        header: commonMessages.expectedResult,
        value: expectedResult,
      })}
    </section>
  );
};
