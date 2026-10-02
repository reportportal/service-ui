/*
 * Copyright 2024 EPAM Systems
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

import { createClassnames, highlightText } from 'common/utils';
import type { TestCaseAiExtension } from 'types/aiFactory';
import { AdaptiveTagList } from 'pages/inside/productVersionPage/linkedTestCasesTab/tagList';
import { PriorityIcon } from 'pages/inside/common/priorityIcon';
import { AiChip } from 'pages/inside/aiFactory/common';
import { ReviewFlags } from 'pages/inside/aiFactory/library';
import type { TestCasePriority } from 'types/testCase';

import { messages } from './messages';

import styles from './testCaseNameCell.scss';

const cx = createClassnames(styles);

interface TestCaseNameCellProps {
  displayId: string;
  priority: TestCasePriority;
  name: string;
  tags: string[];
  searchQuery?: string;
  ai?: TestCaseAiExtension['ai'];
  review?: TestCaseAiExtension['review'];
}

export const TestCaseNameCell = ({
  displayId,
  priority,
  name,
  tags,
  searchQuery,
  ai,
  review,
}: TestCaseNameCellProps) => {
  const { formatMessage } = useIntl();
  const title = `${displayId} ${name}`;
  const generatedByIterationTooltip = ai?.generatedByIteration
    ? formatMessage(
        ai.modifiedByAgent ? messages.generatedByIterationModified : messages.generatedByIteration,
        {
          number: ai.generatedByIteration.number,
        },
      )
    : undefined;

  return (
    <div className={cx('name-section')}>
      {priority && <PriorityIcon priority={priority} />}
      <div className={cx('name-content')}>
        <div className={cx('test-name-row')} title={title}>
          <span className={cx('business-id')}>
            {highlightText(displayId, searchQuery || '', cx('highlight'))}
          </span>
          {generatedByIterationTooltip && (
            <div className={cx('ai-chip')}>
              <AiChip tooltip={generatedByIterationTooltip} />
            </div>
          )}
          <span className={cx('test-name')}>
            {highlightText(name, searchQuery || '', cx('highlight'))}
          </span>
        </div>
        <div className={cx('tags-section')}>
          <AdaptiveTagList tags={tags} isShowAllView />
        </div>
        {ai && <ReviewFlags review={review} />}
      </div>
    </div>
  );
};
