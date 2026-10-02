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

import { formatCost, formatTokens, createClassnames } from 'common/utils';
import { CollapsibleSection } from 'components/collapsibleSection';
import { CostLabel } from 'pages/inside/aiFactory/common';
import { AiDetailsSectionState } from 'pages/inside/aiFactory/common/aiDetailsSectionState';
import type { TestCaseAiLoadState } from 'pages/inside/aiFactory/lifecycle';

import { messages } from './messages';
import styles from './generationCost.scss';

const cx = createClassnames(styles);

export interface GenerationCostProps {
  aiDetailsState: TestCaseAiLoadState;
}

export const GenerationCost = ({ aiDetailsState }: GenerationCostProps) => {
  const { formatMessage } = useIntl();
  const { data, isLoading, isError, reload } = aiDetailsState;
  const cost = data?.cost;

  const content = cost ? (
    <div className={cx('generation-cost')} data-automation-id="generationCost">
      <div
        className={cx('generation-cost__row', 'generation-cost__total')}
        data-automation-id="generation-cost-total"
      >
        <span>{formatMessage(messages.approxTotal)}</span>
        <CostLabel amount={cost.approxTotal} />
      </div>
      <div className={cx('generation-cost__row')}>
        <div>
          <div className={cx('generation-cost__label')}>
            {formatMessage(messages.iterationShare, {
              number: cost.iterationShare.iterationNumber,
            })}
          </div>
          <div className={cx('generation-cost__meta')}>
            {formatMessage(messages.shareFormula, {
              baseCost: formatCost(cost.iterationShare.iterationBaseCost),
              casesCount: cost.iterationShare.casesCount,
              amount: formatCost(cost.iterationShare.amount),
            })}
          </div>
        </div>
        <CostLabel amount={cost.iterationShare.amount} approx={false} />
      </div>
      {cost.fixRounds.map(({ round, amount }) => (
        <div key={round} className={cx('generation-cost__row')}>
          <span>{formatMessage(messages.fixRound, { number: round })}</span>
          <CostLabel amount={amount} approx={false} />
        </div>
      ))}
      <div className={cx('generation-cost__tokens')}>
        <div className={cx('generation-cost__label')}>{formatMessage(messages.tokenUsage)}</div>
        <div className={cx('generation-cost__meta')}>
          {formatMessage(messages.tokenLine, {
            input: formatTokens(cost.tokens.input),
            cacheRead: formatTokens(cost.tokens.cacheRead),
            cacheWrite: formatTokens(cost.tokens.cacheWrite),
            output: formatTokens(cost.tokens.output),
          })}
        </div>
        <div className={cx('generation-cost__meta')}>
          {formatMessage(messages.model, { model: cost.model })}
        </div>
      </div>
    </div>
  ) : null;
  const sectionContent =
    content || isLoading || isError ? (
      <AiDetailsSectionState
        className={cx('generation-cost__state')}
        isLoading={isLoading}
        isError={isError}
        loadingLabel={formatMessage(messages.loading)}
        errorMessage={formatMessage(messages.loadError)}
        retryLabel={formatMessage(messages.retry)}
        retryAutomationId="retry-generation-cost"
        onRetry={reload}
      >
        {content}
      </AiDetailsSectionState>
    ) : null;

  return (
    <CollapsibleSection
      title={formatMessage(messages.title)}
      defaultMessage={formatMessage(messages.empty)}
      isInitiallyExpanded={Boolean(cost) || isLoading || isError}
    >
      {sectionContent}
    </CollapsibleSection>
  );
};
