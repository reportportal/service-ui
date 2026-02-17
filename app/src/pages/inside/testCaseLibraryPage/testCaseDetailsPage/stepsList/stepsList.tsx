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

import { useIntl } from 'react-intl';

import { createClassnames } from 'common/utils';
import { commonMessages } from 'pages/inside/common/common-messages';

import { Step as StepProp } from '../../types';
import { Step } from '../step';

import styles from './stepsList.scss';

const cx = createClassnames(styles);

interface StepsListProps {
  steps: StepProp[];
}

export const StepsList = ({ steps }: StepsListProps) => {
  const { formatMessage } = useIntl();

  return (
    <section className={cx('steps-list')}>
      <div className={cx('steps-list__columns')}>
        <div className={cx('steps-list__columns_number')}>№</div>
        <div>
          <div className={cx('steps-list__columns_name')}>{formatMessage(commonMessages.instructions)}</div>
          <div className={cx('steps-list__columns_name')}>{formatMessage(commonMessages.expectedResult)}</div>
        </div>
      </div>
      <ul className={cx('steps-list__content')}>
        {steps.map((step, index) => (
          <Step
            key={step.id}
            index={index + 1}
            expectedResult={step.expectedResult}
            instructions={step.instructions}
            attachments={step.attachments}
          />
        ))}
      </ul>
    </section>
  );
};
