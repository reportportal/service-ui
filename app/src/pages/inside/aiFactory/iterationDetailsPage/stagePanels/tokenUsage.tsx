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

import { createClassnames, formatCost, formatTokens } from 'common/utils';
import { TokenUsageRS } from 'types/aiFactory';

import { messages } from '../messages';
import styles from './stagePanels.scss';

const cx = createClassnames(styles);

export interface TokenUsageProps {
  tokens: TokenUsageRS[];
}

export const TokenUsage = ({ tokens }: TokenUsageProps) => {
  const { formatMessage } = useIntl();

  if (!tokens.length) {
    return null;
  }

  return (
    <div data-automation-id="tokenUsage">
      <p className={cx('note')}>{formatMessage(messages.tokenUsageTitle)}</p>
      {tokens.map((usage) => (
        <p key={usage.model} className={cx('note')}>
          {formatMessage(messages.tokenUsageLine, {
            model: usage.model,
            input: formatTokens(usage.input),
            cacheRead: formatTokens(usage.cacheRead),
            cacheWrite: formatTokens(usage.cacheWrite),
            output: formatTokens(usage.output),
            cost: formatCost(usage.cost),
          })}
        </p>
      ))}
    </div>
  );
};
