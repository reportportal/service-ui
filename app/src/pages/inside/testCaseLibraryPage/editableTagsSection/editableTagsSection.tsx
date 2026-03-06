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

import { ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { isEmpty } from 'es-toolkit/compat';

import { commonMessages } from 'pages/inside/common/common-messages/common-messages';
import { AdaptiveTagList } from 'pages/inside/productVersionPage/linkedTestCasesTab/tagList';

import { Attribute } from '../types';
import { SectionWithHeader } from '../sectionWithHeader';
import { InfoBlock } from '../infoBlock';

interface EditableTagsSectionProps {
  className?: string;
  variant: 'sidebar' | 'modal';
  addButton?: ReactNode;
  tags?: Attribute[];
  onTagRemove?: (tagKey: string) => void;
  title?: string;
  emptyMessage?: string;
}

export const EditableTagsSection = ({
  className = '',
  variant,
  addButton,
  tags = [],
  onTagRemove,
  title,
  emptyMessage,
}: EditableTagsSectionProps) => {
  const { formatMessage } = useIntl();

  const tagKeys = tags.map(({ key }) => key);

  return (
    <SectionWithHeader
      title={title || formatMessage(commonMessages.tags)}
      headerControl={addButton}
      className={className}
      variant={variant}
    >
      {isEmpty(tags) ? (
        <InfoBlock label={emptyMessage || formatMessage(commonMessages.noTagsAdded)} />
      ) : (
        <AdaptiveTagList
          tags={tagKeys}
          onRemoveTag={onTagRemove}
          isShowAllView
          defaultVisibleLines={20}
        />
      )}
    </SectionWithHeader>
  );
};
