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

import { useState } from 'react';
import { useIntl } from 'react-intl';
import { ArrowDownIcon, Button } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import {
  isReducedPipeline,
  isReducedPipelineIteration,
  PipelineCatalogItem,
  PipelineIterationItem,
} from 'controllers/aiFactory/pipelines';
import { PipelineType } from 'types/aiFactory';

import { PipelineSettingsButton } from '../../pipelineSettings';
import { IterationCard } from '../iterationCard';
import { ReducedIterationCard } from '../iterationCard/reducedIterationCard';
import { messages } from '../messages';
import styles from './pipelineGroup.scss';

const cx = createClassnames(styles);

export interface PipelineGroupProps {
  pipeline: PipelineCatalogItem;
  iterations: PipelineIterationItem[] | undefined;
  isLoading: boolean;
  hasError: boolean;
  isSearching: boolean;
  onRetry: () => void;
}

export const PipelineGroup = ({
  pipeline,
  iterations,
  isLoading,
  hasError,
  isSearching,
  onRetry,
}: PipelineGroupProps) => {
  const { formatMessage } = useIntl();
  const [isOpen, setIsOpen] = useState(true);

  const renderIteration = (iteration: PipelineIterationItem) => {
    if (isReducedPipelineIteration(iteration)) {
      return <ReducedIterationCard key={iteration.id} iteration={iteration} />;
    }
    if (isReducedPipeline(pipeline)) {
      return null;
    }
    return <IterationCard key={iteration.id} pipelineType={pipeline.type} iteration={iteration} />;
  };

  const renderBody = () => {
    if (isLoading && !iterations) {
      return <SpinningPreloader />;
    }
    if (hasError) {
      return (
        <div className={cx('error')}>
          <span>{formatMessage(messages.iterationsUnavailable)}</span>
          <Button variant="text" onClick={onRetry} data-automation-id="retryPipelineIterations">
            {formatMessage(messages.retry)}
          </Button>
        </div>
      );
    }
    if (!iterations || iterations.length === 0) {
      return (
        <p className={cx('empty')}>
          {formatMessage(isSearching ? messages.noIterationsMatch : messages.noPipelines)}
        </p>
      );
    }
    return <div className={cx('cards')}>{iterations.map(renderIteration)}</div>;
  };

  return (
    <section className={cx('group')} data-automation-id="pipelineGroup">
      <div className={cx('group__header')}>
        <button
          type="button"
          className={cx('group__toggle')}
          onClick={() => setIsOpen(!isOpen)}
          data-automation-id="pipelineGroupHeader"
          aria-expanded={isOpen}
        >
          <ArrowDownIcon className={cx('group__chevron', { 'group__chevron--open': isOpen })} />
          <span className={cx('group__name')}>{pipeline.name}</span>
          <span className={cx('group__meta')}>
            {isReducedPipeline(pipeline)
              ? formatMessage(messages.repositoryNotProvided)
              : pipeline.repository}
          </span>
          {pipeline.iterationsCount !== undefined && (
            <span className={cx('group__meta')}>
              {formatMessage(messages.iterationsCount, { count: pipeline.iterationsCount })}
            </span>
          )}
          {!isReducedPipeline(pipeline) &&
            pipeline.type === PipelineType.GENERATION &&
            pipeline.settings && (
              <span className={cx('group__meta')}>
                {formatMessage(
                  pipeline.settings.autoReady ? messages.autoReadyOn : messages.autoReadyOff,
                  { threshold: pipeline.settings.threshold },
                )}
              </span>
            )}
        </button>
        {!isReducedPipeline(pipeline) && <PipelineSettingsButton pipeline={pipeline} />}
      </div>
      {isOpen && <div className={cx('group__body')}>{renderBody()}</div>}
    </section>
  );
};
