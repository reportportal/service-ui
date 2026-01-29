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

import { ClipboardButton } from 'components/buttons/copyClipboardButton';
import { createClassnames } from 'common/utils';
import { Requirement } from 'pages/inside/testCaseLibraryPage/types';

import { processText } from './utils';

import styles from './requirementsList.scss';

const cx = createClassnames(styles);

interface RequirementsListProps {
  items: Requirement[];
  isCopyEnabled?: boolean;
}

export const RequirementsList = ({ items, isCopyEnabled = false }: RequirementsListProps) => {

  return (
    <div className={cx('requirements-list')}>
      {items.map((item) => (
        <div key={item.id} className={cx('requirement-item')}>
          <div className={cx('text-container')} title={item.value}>
            {processText(item.value)}
          </div>
          {isCopyEnabled && (
           <ClipboardButton text={item.value} className={cx('custom-button')}/>
          )}
        </div>
      ))}
    </div>
  );
};
