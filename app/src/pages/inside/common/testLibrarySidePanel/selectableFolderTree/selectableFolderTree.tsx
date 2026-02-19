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

import { useSelector } from 'react-redux';

import { transformedFoldersSelector } from 'controllers/testCase';
import { ScrollWrapper } from 'components/main/scrollWrapper';
import { createClassnames } from 'common/utils';

import { SelectableFolder } from '../selectableFolder/selectableFolder';

import treeStyles from '../../expandedOptions/folder/folder.scss';
import styles from './selectableFolderTree.scss';

const cx = createClassnames(styles, treeStyles);

export const SelectableFolderTree = () => {
  const folders = useSelector(transformedFoldersSelector);

  return (
    <div className={cx('selectable-folder-tree')}>
      <ScrollWrapper className={cx('selectable-folder-tree__scroll-wrapper')}>
        <ul className={cx('folders-tree', 'selectable-folder-tree__outer')} role="tree">
          {folders.map((folder, index) => (
            <SelectableFolder folder={folder} key={folder.id || `${folder.name}-${index}`} />
          ))}
        </ul>
      </ScrollWrapper>
    </div>
  );
};
