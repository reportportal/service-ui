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

import { formatCost } from 'common/utils';

import { messages } from './messages';

export interface CostLabelProps {
  /** Cost in USD, as supplied by the pipeline (docs/ai-factory-poc/01-knowledge-base.md §4.6). */
  amount: number;
  /**
   * Prefix with "≈" (the pipeline's costs are estimates). Defaults to `true`; pass `false` for an
   * exact figure such as a single fix round's cost.
   */
  approx?: boolean;
}

export const CostLabel = ({ amount, approx = true }: CostLabelProps) => {
  const { formatMessage } = useIntl();
  const formattedAmount = approx ? `≈ ${formatCost(amount)}` : formatCost(amount);

  return (
    <span data-automation-id="costLabel">
      {formatMessage(messages.pipelineEstimate, { amount: formattedAmount })}
    </span>
  );
};
