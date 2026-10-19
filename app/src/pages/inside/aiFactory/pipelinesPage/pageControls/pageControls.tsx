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
import { Button } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import type { PipelinePageState } from 'controllers/aiFactory/pipelines';

import { messages } from '../messages';
import styles from './pageControls.scss';

const cx = createClassnames(styles);

export interface PageControlsProps {
  page: PipelinePageState;
  isLoading: boolean;
  onPageChange: (offset: number) => void;
}

export const PageControls = ({ page, isLoading, onPageChange }: PageControlsProps) => {
  const { formatMessage } = useIntl();
  if (page.totalPages <= 1) {
    return null;
  }
  return (
    <nav className={cx('page-controls')} aria-label={formatMessage(messages.paginationLabel)}>
      <Button
        variant="text"
        disabled={isLoading || page.offset === 0}
        onClick={() => onPageChange(Math.max(0, page.offset - page.size))}
      >
        {formatMessage(messages.previousPage)}
      </Button>
      <span>{formatMessage(messages.pageCount, { current: page.number, total: page.totalPages })}</span>
      <Button
        variant="text"
        disabled={isLoading || page.offset + page.size >= page.totalElements}
        onClick={() => onPageChange(page.offset + page.size)}
      >
        {formatMessage(messages.nextPage)}
      </Button>
    </nav>
  );
};
