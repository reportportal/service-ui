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
import { RequirementsList } from 'pages/inside/common/requirementsList/requirementsList';
import { Precondition } from 'pages/inside/testCaseLibraryPage/testCaseDetailsPage/precondition';
import { StepsList } from 'pages/inside/testCaseLibraryPage/testCaseDetailsPage/stepsList';
import {
  Step as StepType,
  Attachment as TestCaseLibraryAttachment,
} from 'pages/inside/testCaseLibraryPage/types';
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
        title={formatMessage(messages.requirements)}
        defaultMessage={
          hasRequirements ? undefined : formatMessage(messages.requirementsAreNotSpecified)
        }
      >
        {hasRequirements ? <RequirementsList items={requirements} /> : null}
      </CollapsibleSection>

      <CollapsibleSection
        title={formatMessage(commonMessages.precondition)}
        defaultMessage={
          !preconditionValue && !hasPreconditionAttachments
            ? formatMessage(messages.preconditionIsNotSpecified)
            : undefined
        }
      >
        {(preconditionValue || hasPreconditionAttachments) && (
          <Precondition
            preconditions={{
              value: preconditionValue || '',
              attachments: (manualScenario.preconditions?.attachments ||
                []) as unknown as TestCaseLibraryAttachment[],
            }}
          />
        )}
      </CollapsibleSection>

      <CollapsibleSection
        title={formatMessage(commonMessages.steps)}
        defaultMessage={isEmpty(steps) ? formatMessage(messages.noStepsSpecified) : undefined}
      >
        {!isEmpty(steps) && <StepsList steps={steps as StepType[]} />}
      </CollapsibleSection>
    </div>
  );
};
