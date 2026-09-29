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

import { defineMessages, useIntl } from 'react-intl';
import { createClassnames } from 'common/utils';
import { ConditionalTooltip } from 'components/main/conditionalTooltip';
import styles from './scoreChip.scss';

const cx = createClassnames(styles);

const messages = defineMessages({
  obsolete: {
    id: 'ScoreChip.obsolete',
    defaultMessage: 'Evaluation is obsolete after a scenario edit',
  },
});

export interface ScoreChipProps {
  /** Total AI evaluation score (docs/ai-factory-poc/01-knowledge-base.md §4.5). */
  score: number;
  /** The evaluation no longer matches the current scenario (`EvaluationState.OBSOLETE`). */
  obsolete?: boolean;
}

export const ScoreChip = ({ score, obsolete = false }: ScoreChipProps) => {
  const { formatMessage } = useIntl();

  return (
    <ConditionalTooltip content={obsolete ? formatMessage(messages.obsolete) : undefined} placement="top">
      <span
        className={cx('chip', { obsolete })}
        data-automation-id="scoreChip"
      >
        {`★ ${score}`}
      </span>
    </ConditionalTooltip>
  );
};
