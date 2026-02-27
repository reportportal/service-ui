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
import { useUserPermissions } from 'hooks/useUserPermissions';
import { EmptyStatePage } from 'pages/inside/common/emptyStatePage';

import { useEditScenarioModal } from '../../editScenarioModal';
import { DetailsEmptyStateProps } from '../../types';
import { messages } from '../messages';
import { commonMessages } from '../../commonMessages';

export const DetailsEmptyState = ({ testCase }: DetailsEmptyStateProps) => {
  const { formatMessage } = useIntl();
  const { canManageTestCases } = useUserPermissions();
  const { openModal } = useEditScenarioModal();

  const handleEditScenario = () => {
    openModal({ testCase });
  };

  const buttons = canManageTestCases
    ? [
        {
          name: formatMessage(commonMessages.editScenario),
          dataAutomationId: 'editScenarioButton',
          handleButton: handleEditScenario,
          variant: 'primary' as const,
          isCompact: false,
        },
      ]
    : [];

  return (
    <EmptyStatePage
      imageType="plus"
      title={formatMessage(messages.noScenarioDetails)}
      description={formatMessage(messages.noScenarioDetailsDescription)}
      buttons={buttons}
    />
  );
};
