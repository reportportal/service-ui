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

import { PipelineRS } from 'types/aiFactory';

import { messages } from './messages';
import { usePipelineSettingsModal } from './usePipelineSettingsModal';

export interface PipelineSettingsButtonProps {
  pipeline: PipelineRS;
}

export const PipelineSettingsButton = ({ pipeline }: PipelineSettingsButtonProps) => {
  const { formatMessage } = useIntl();
  const { openModal } = usePipelineSettingsModal();

  return (
    <Button
      variant="text"
      adjustWidthOn="content"
      data-automation-id={`pipelineSettingsButton-${pipeline.id}`}
      onClick={() => openModal({ pipeline })}
    >
      {formatMessage(messages.action)}
    </Button>
  );
};
