/*
 * Copyright 2025 EPAM Systems
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

import { ReactElement, useState } from 'react';
import classNames from 'classnames/bind';
import { ChevronRightBreadcrumbsIcon } from '@reportportal/ui-kit';
import styles from './collapsibleSection.scss';

const cx = classNames.bind(styles);

interface CollapsibleSectionProps {
  title: string;
  childComponent?: ReactElement;
  defaultMessage?: string;
  isInitiallyExpanded?: boolean;
}

export const CollapsibleSection = ({
  title,
  childComponent,
  defaultMessage,
  isInitiallyExpanded = true,
}: CollapsibleSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(isInitiallyExpanded);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={cx('collapsible-section')}>
      <button
        type="button"
        className={cx('section-header')}
        onClick={handleToggle}
        aria-expanded={isExpanded}
      >
        <div className={cx('chevron-wrapper', { rotated: isExpanded })}>
          <ChevronRightBreadcrumbsIcon />
        </div>
        <span className={cx('section-title')}>{title}</span>
      </button>

      {isExpanded && (
        <div className={cx('section-content')}>
          {childComponent || <div className={cx('default-content')}>{defaultMessage}</div>}
        </div>
      )}
    </div>
  );
};
