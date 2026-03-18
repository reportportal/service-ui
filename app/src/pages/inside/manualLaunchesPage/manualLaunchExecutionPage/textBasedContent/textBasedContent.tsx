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
import { isEmpty } from 'es-toolkit/compat';

import { createClassnames } from 'common/utils';
import { CollapsibleSection } from 'components/collapsibleSection';
import { FieldSection } from 'pages/inside/common/fieldSection';
import { RequirementsList } from 'pages/inside/common/requirementsList/requirementsList';
import { AttachmentList, type Attachment } from 'pages/inside/common/attachmentList';
import { Scenario } from 'pages/inside/common/scenario';
import { hasScenarioContent } from 'pages/inside/common/scenarioUtils';

import { messages } from '../messages';
import { commonMessages } from 'pages/inside/common/common-messages';
import type { ExecutionContentProps } from '../types';
import { requirementsToItems } from '../utils';

import styles from './textBasedContent.scss';

const cx = createClassnames(styles);

export const TextBasedContent = ({ execution: { manualScenario } }: ExecutionContentProps) => {
  const { formatMessage } = useIntl();
  if (!manualScenario) return null;

  const requirements = requirementsToItems(manualScenario.requirements);
  const hasRequirements = !isEmpty(requirements);
  const preconditionValue = manualScenario.preconditions?.value;
  const hasPreconditionAttachments = !isEmpty(manualScenario.preconditions?.attachments);
  const { instructions, expectedResult, attachments = [] } = manualScenario;
  const hasAttachments = !isEmpty(attachments);

  const hasScenario = hasScenarioContent(manualScenario);

  return (
    <div className={cx('text-based-content')}>
      <CollapsibleSection
        title={formatMessage(messages.requirements)}
        defaultMessage={
          hasRequirements ? undefined : formatMessage(messages.requirementsAreNotSpecified)
        }
      >
        {hasRequirements ? <RequirementsList items={requirements} /> : null}
      </CollapsibleSection>

      <CollapsibleSection
        title={formatMessage(commonMessages.scenario)}
        defaultMessage={hasScenario ? undefined : formatMessage(messages.noDetailsForScenario)}
      >
        {hasScenario && (
          <div className={cx('scenario-sections')}>
            {(preconditionValue || instructions || expectedResult) && (
              <Scenario
                precondition={preconditionValue}
                instructions={instructions}
                expectedResult={expectedResult}
              />
            )}
            {hasPreconditionAttachments && (
              <FieldSection
                title={`${formatMessage(commonMessages.attachments)} ${manualScenario.preconditions?.attachments?.length ?? 0}`}
              >
                <AttachmentList
                  attachments={
                    (manualScenario.preconditions?.attachments ?? []) as unknown as Attachment[]
                  }
                  className={cx('attachments-list')}
                  withPreview
                />
              </FieldSection>
            )}
          </div>
        )}
      </CollapsibleSection>

      <CollapsibleSection
        title={formatMessage(commonMessages.attachments)}
        defaultMessage={hasAttachments ? undefined : formatMessage(messages.noAttachments)}
      >
        {hasAttachments ? (
          <AttachmentList
            attachments={attachments as unknown as Attachment[]}
            className={cx('attachments-list')}
            withPreview
          />
        ) : null}
      </CollapsibleSection>
    </div>
  );
};
