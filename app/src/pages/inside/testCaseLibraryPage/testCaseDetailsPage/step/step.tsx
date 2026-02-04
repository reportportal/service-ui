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

import { isEmpty } from 'es-toolkit/compat';

import { createClassnames } from 'common/utils';

import { AttachmentList } from '../../attachmentList';
import { Attachment } from '../../types';

import styles from './step.scss';

const cx = createClassnames(styles);

interface StepProps {
  index: number;
  instructions?: string;
  expectedResult?: string;
  attachments: Attachment[];
}

export const Step = ({
  index,
  instructions = '',
  expectedResult = '',
  attachments,
}: StepProps) => (
  <li className={cx('step')}>
    <div className={cx('step__number')}>{index}</div>
    <div className={cx('step__content')}>
      {
        (instructions || expectedResult) && (
          <div className={cx('step__description')}>
            <div className={cx('step__instruction')}>
              {instructions}
            </div>
            <div className={cx('step__expected-result')}>
              {expectedResult}
            </div>
          </div>
        )
      }
      {
        !isEmpty(attachments) &&
          <div className={cx('step__attachments-wrapper')}>
            <h4>Attachments {attachments.length}</h4>
            <AttachmentList
              attachments={attachments}
              className={cx('step__attachments-list')}
            />
          </div>
      }
    </div>
  </li>
);
