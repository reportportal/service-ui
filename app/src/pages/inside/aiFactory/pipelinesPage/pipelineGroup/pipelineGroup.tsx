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
import { ArrowDownIcon } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { SpinningPreloader } from 'components/preloaders/spinningPreloader';
import { IterationSummaryRS, PipelineRS, PipelineType } from 'types/aiFactory';

import { IterationCard } from '../iterationCard';
import { messages } from '../messages';
import styles from './pipelineGroup.scss';

const cx = createClassnames(styles);

export interface PipelineGroupProps {
  pipeline: PipelineRS;
  iterations: IterationSummaryRS[] | undefined;
  isLoading: boolean;
  isSearching: boolean;
}

export const PipelineGroup = ({ pipeline, iterations, isLoading, isSearching }: PipelineGroupProps) => {
  const { formatMessage } = useIntl();
  const [isOpen, setIsOpen] = useState(true);

  const renderBody = () => {
    if (isLoading && !iterations) {
      return <SpinningPreloader />;
    }
    if (!iterations || iterations.length === 0) {
      return (
        <p className={cx('empty')}>
          {formatMessage(isSearching ? messages.noIterationsMatch : messages.noPipelines)}
        </p>
      );
    }
    return (
      <div className={cx('cards')}>
        {iterations.map((iteration) => (
          <IterationCard key={iteration.id} pipelineType={pipeline.type} iteration={iteration} />
        ))}
      </div>
    );
  };

  return (
    <section className={cx('group')} data-automation-id="pipelineGroup">
      <button
        type="button"
        className={cx('group__header')}
        onClick={() => setIsOpen(!isOpen)}
        data-automation-id="pipelineGroupHeader"
      >
        <ArrowDownIcon className={cx('group__chevron', { 'group__chevron--open': isOpen })} />
        <span className={cx('group__name')}>{pipeline.name}</span>
        <span className={cx('group__meta')}>{pipeline.repository}</span>
        <span className={cx('group__meta')}>
          {formatMessage(messages.iterationsCount, { count: pipeline.iterationsCount })}
        </span>
        {pipeline.type === PipelineType.GENERATION && pipeline.settings && (
          <span className={cx('group__meta')}>
            {formatMessage(
              pipeline.settings.autoReady ? messages.autoReadyOn : messages.autoReadyOff,
              { threshold: pipeline.settings.threshold },
            )}
          </span>
        )}
      </button>
      {isOpen && <div className={cx('group__body')}>{renderBody()}</div>}
    </section>
  );
};
