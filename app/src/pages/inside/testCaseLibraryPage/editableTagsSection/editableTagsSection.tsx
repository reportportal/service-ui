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

import { useIntl } from 'react-intl';
import { Button, PlusIcon } from '@reportportal/ui-kit';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';

import { SectionWithHeader } from '../sectionWithHeader';
import { InfoBlock } from '../infoBlock';
import { messages } from '../testCaseDetailsPage/messages';

interface EditableTagsSectionProps {
  onAddTag: () => void;
  className?: string;
}

export const EditableTagsSection = ({ onAddTag, className = '' }: EditableTagsSectionProps) => {
  const { formatMessage } = useIntl();

  const headerControl = (
    <Button onClick={onAddTag} variant="text">
      <PlusIcon />
      {formatMessage(COMMON_LOCALE_KEYS.ADD)}
    </Button>
  );

  return (
    <SectionWithHeader
      title={formatMessage(messages.tags)}
      headerControl={headerControl}
      className={className}
    >
      <InfoBlock label={formatMessage(messages.noTagsAdded)} />
    </SectionWithHeader>
  );
};
