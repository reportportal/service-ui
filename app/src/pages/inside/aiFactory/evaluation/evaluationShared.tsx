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

import type { ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { BubblesLoader, Button } from '@reportportal/ui-kit';

import { ScoreBar } from 'pages/inside/aiFactory/common';
import type { TestCaseAiLoadState } from 'pages/inside/aiFactory/lifecycle';
import type { GradeCriterionRS } from 'types/aiFactory';

import { CRITERION_MESSAGE } from './criterionMessages';
import { messages } from './messages';

export interface CriterionScoreProps {
  criterion: GradeCriterionRS;
  headingClassName: string;
}

export const CriterionScore = ({ criterion, headingClassName }: CriterionScoreProps) => {
  const { formatMessage } = useIntl();

  return (
    <>
      <div className={headingClassName}>
        <span>{formatMessage(CRITERION_MESSAGE[criterion.key])}</span>
        <span>{`${criterion.score}/${criterion.maxScore}`}</span>
      </div>
      <ScoreBar value={criterion.score} max={criterion.maxScore} />
    </>
  );
};

export interface EvaluationContentStateProps {
  children: ReactNode;
  className: string;
  state: Pick<TestCaseAiLoadState, 'isLoading' | 'isError' | 'reload'>;
  retryAutomationId: string;
}

export const EvaluationContentState = ({
  children,
  className,
  state: { isLoading, isError, reload },
  retryAutomationId,
}: EvaluationContentStateProps) => {
  const { formatMessage } = useIntl();

  if (isLoading) {
    return (
      <output className={className} aria-label={formatMessage(messages.loading)}>
        <BubblesLoader />
      </output>
    );
  }

  if (isError) {
    return (
      <div className={className} role="alert">
        <span>{formatMessage(messages.loadError)}</span>
        <Button
          variant="text"
          adjustWidthOn="content"
          onClick={reload}
          data-automation-id={retryAutomationId}
        >
          {formatMessage(messages.retry)}
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};

export const renderEvaluationContent = (props: EvaluationContentStateProps) =>
  props.children || props.state.isLoading || props.state.isError ? (
    <EvaluationContentState {...props} />
  ) : null;
