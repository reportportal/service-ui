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
import { StepsList } from 'pages/inside/common/testCaseList/stepsList';
import { Step as StepType } from 'pages/inside/testCaseLibraryPage/types';

import { messages } from '../messages';
import { commonMessages } from 'pages/inside/common/common-messages';
import type { ExecutionContentProps } from '../types';
import { requirementsToItems } from '../utils';

import styles from './stepsBasedContent.scss';

const cx = createClassnames(styles);

export const StepsBasedContent = ({ execution: { manualScenario } }: ExecutionContentProps) => {
  const { formatMessage } = useIntl();
  if (!manualScenario) return null;

  const requirements = requirementsToItems(manualScenario.requirements);
  const hasRequirements = !isEmpty(requirements);
  const preconditionValue = manualScenario.preconditions?.value;
  const hasPreconditionAttachments = !isEmpty(manualScenario.preconditions?.attachments);
  const { steps = [] } = manualScenario;

  return (
    <div className={cx('steps-based-content')}>
      <CollapsibleSection
        title={formatMessage(messages.requirementsLink)}
        defaultMessage={hasRequirements ? undefined : formatMessage(messages.noAttachments)}
      >
        {hasRequirements ? <RequirementsList items={requirements} /> : null}
      </CollapsibleSection>

      <CollapsibleSection title={formatMessage(commonMessages.precondition)}>
        <div className={cx('precondition-block')}>
          {preconditionValue && <div className={cx('text-block')}>{preconditionValue}</div>}
          {hasPreconditionAttachments && (
            <>
              {preconditionValue && <div className={cx('section-divider')} />}
              <FieldSection
                title={`${formatMessage(commonMessages.attachments)} ${manualScenario.preconditions?.attachments?.length ?? 0}`}
              >
                <AttachmentList
                  attachments={
                    (manualScenario.preconditions?.attachments ?? []) as unknown as Attachment[]
                  }
                />
              </FieldSection>
            </>
          )}
          {!preconditionValue && !hasPreconditionAttachments && (
            <div className={cx('empty-hint')}>{formatMessage(messages.noAttachments)}</div>
          )}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title={formatMessage(commonMessages.steps)}>
        {isEmpty(steps) ? (
          <div className={cx('empty-hint')}>{formatMessage(messages.noAttachments)}</div>
        ) : (
          <StepsList steps={steps as StepType[]} />
        )}
      </CollapsibleSection>
    </div>
  );
};
