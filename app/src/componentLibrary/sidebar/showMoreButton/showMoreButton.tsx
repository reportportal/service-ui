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
import { ArrowRightIcon, MeatballMenuIcon } from '@reportportal/ui-kit';
import { createClassnames } from 'common/utils';
import styles from './showMoreButton.scss';

const cx = createClassnames(styles);

const messages = defineMessages({
  showMore: {
    id: 'Sidebar.showMore',
    defaultMessage: 'Show more',
  },
});

interface ShowMoreButtonProps {
  onClick?: () => void;
  isActive?: boolean;
}

export const ShowMoreButton = ({ onClick, isActive = false }: ShowMoreButtonProps) => {
  const { formatMessage } = useIntl();

  return (
    <button
      type="button"
      className={cx('show-more-button', { active: isActive })}
      onClick={onClick}
      aria-expanded={isActive}
    >
      <i className={cx('dots-icon')}>
        <MeatballMenuIcon />
      </i>
      <div className={cx('title-container')}>
        <span className={cx('title')}>{formatMessage(messages.showMore)}</span>
        <i className={cx('chevron-icon')}>
          <ArrowRightIcon />
        </i>
      </div>
    </button>
  );
};
