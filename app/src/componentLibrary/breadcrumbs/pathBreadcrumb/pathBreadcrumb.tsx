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

import { memo } from 'react';
import { ChevronRightBreadcrumbsIcon, MoveToFolderIcon } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';

import styles from './pathBreadcrumb.scss';

const cx = createClassnames(styles);

interface PathBreadcrumbProps {
  path: string[];
  color?: string;
  isIconVisible?: boolean;
}

export const PathBreadcrumb = memo(({ path, color, isIconVisible = true }: PathBreadcrumbProps) => {
  const customStyle = color ? { color } : undefined;

  return (
    <div className={cx('path-breadcrumb')} style={customStyle}>
      {isIconVisible && <MoveToFolderIcon />}
      <div className={cx('path-text')}>
        {path.map((item, index) => (
          <span key={item} className={cx('path-item-container')}>
            {index > 0 && (
              <div className={cx('path-separator')}>
                <ChevronRightBreadcrumbsIcon />
              </div>
            )}
            <span className={cx('path-item')}>{item}</span>
          </span>
        ))}
      </div>
    </div>
  );
});
