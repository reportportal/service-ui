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
import { AttachmentList } from 'pages/inside/testCaseLibraryPage/attachmentList';
import { Attachment } from 'pages/inside/testCaseLibraryPage/types';

import { messages } from '../messages';
import { commonMessages } from 'pages/inside/common/common-messages';
import type { ExecutionContentProps } from '../types';
import { requirementsToItems } from '../utils';

import styles from './textBasedContent.scss';

const cx = createClassnames(styles);

export const TextBasedContent = ({ execution }: ExecutionContentProps) => {
  const { formatMessage } = useIntl();
  const scenario = execution.manualScenario;
  if (!scenario) return null;

  const requirements = requirementsToItems(scenario.requirements);
  const hasRequirements = !isEmpty(requirements);
  const preconditionValue = scenario.preconditions?.value;
  const hasPreconditionAttachments = !isEmpty(scenario.preconditions?.attachments);
  const instructions = scenario.instructions;
  const expectedResult = scenario.expectedResult;
  const attachments = scenario.attachments ?? [];
  const hasAttachments = !isEmpty(attachments);

  return (
    <div className={cx('text-based-content')}>
      <CollapsibleSection
        title={formatMessage(messages.requirementsLink)}
        defaultMessage={hasRequirements ? undefined : formatMessage(messages.noAttachments)}
      >
        {hasRequirements ? <RequirementsList items={requirements} /> : null}
      </CollapsibleSection>

      <CollapsibleSection title={formatMessage(commonMessages.scenario)}>
        <div className={cx('scenario-sections')}>
          {(preconditionValue || hasPreconditionAttachments) && (
            <>
              {preconditionValue && (
                <FieldSection title={formatMessage(commonMessages.precondition)}>
                  <div className={cx('text-block')}>{preconditionValue}</div>
                </FieldSection>
              )}
              {hasPreconditionAttachments && (
                <FieldSection
                  title={`${formatMessage(commonMessages.attachments)} ${scenario.preconditions?.attachments?.length ?? 0}`}
                >
                  <AttachmentList
                    attachments={
                      (scenario.preconditions?.attachments ?? []) as unknown as Attachment[]
                    }
                  />
                </FieldSection>
              )}
            </>
          )}
          {instructions && (
            <FieldSection title={formatMessage(commonMessages.instructions)}>
              <div className={cx('text-block')}>{instructions}</div>
            </FieldSection>
          )}
          {expectedResult && (
            <FieldSection title={formatMessage(commonMessages.expectedResult)}>
              <div className={cx('text-block')}>{expectedResult}</div>
            </FieldSection>
          )}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title={formatMessage(commonMessages.attachments)}
        defaultMessage={hasAttachments ? undefined : formatMessage(messages.noAttachments)}
      >
        {hasAttachments ? (
          <AttachmentList attachments={attachments as unknown as Attachment[]} />
        ) : null}
      </CollapsibleSection>
    </div>
  );
};
