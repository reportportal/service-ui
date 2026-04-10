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

import type { MessageDescriptor } from 'react-intl';
import { Button } from '@reportportal/ui-kit';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';

import { ADJUST_FORM_DOM_ID } from './constants';
import { changeMilestoneStatusModalMessages } from './messages';
import {
  MilestoneStatusModalFooter,
} from './milestoneStatusModalFrame';

type FormatMessageFn = (
  descriptor: MessageDescriptor,
  values?: Record<string, string | number | boolean | Date | null | undefined>,
) => string;

export type BackToScheduledStatusModalFooterProps = {
  closeModal: () => void;
  formatMessage: FormatMessageFn;
  isLoading: boolean;
  adjustMilestone: boolean;
  isAdjustChangeDisabled: boolean;
  onConfirmKeepingFields: () => void;
};

export type BackToTestingStatusModalFooterProps = {
  closeModal: () => void;
  formatMessage: FormatMessageFn;
  isLoading: boolean;
  onConfirm: () => void;
};

export type StartTestingSimpleStatusModalFooterProps = {
  closeModal: () => void;
  formatMessage: FormatMessageFn;
  isLoading: boolean;
  onStart: () => void;
};

export type StartTestingDateChoiceStatusModalFooterProps = {
  closeModal: () => void;
  formatMessage: FormatMessageFn;
  isLoading: boolean;
  onKeepStartDate: () => void;
  onStartWithToday: () => void;
};

export type StartTestingNoStartDateStatusModalFooterProps = {
  closeModal: () => void;
  formatMessage: FormatMessageFn;
  isLoading: boolean;
  onStartWithoutDate: () => void;
  onStartWithToday: () => void;
};

export type CompleteSimpleStatusModalFooterProps = {
  closeModal: () => void;
  formatMessage: FormatMessageFn;
  isLoading: boolean;
  onComplete: () => void;
};

export type CompleteDateChoiceStatusModalFooterProps = {
  closeModal: () => void;
  formatMessage: FormatMessageFn;
  isLoading: boolean;
  onKeepDeadline: () => void;
  onCompleteWithToday: () => void;
};

export type CompleteNoDeadlineStatusModalFooterProps = {
  closeModal: () => void;
  formatMessage: FormatMessageFn;
  isLoading: boolean;
  onCompleteWithoutDeadline: () => void;
  onCompleteWithToday: () => void;
};

export const BackToScheduledStatusModalFooter = ({
  closeModal,
  formatMessage,
  isLoading,
  adjustMilestone,
  isAdjustChangeDisabled,
  onConfirmKeepingFields,
}: BackToScheduledStatusModalFooterProps) => (
  <MilestoneStatusModalFooter>
    <Button variant="ghost" disabled={isLoading} onClick={closeModal}>
      {formatMessage(COMMON_LOCALE_KEYS.CANCEL)}
    </Button>
    <Button
      variant="primary"
      disabled={isLoading || (adjustMilestone && isAdjustChangeDisabled)}
      {...(adjustMilestone
        ? { type: 'submit' as const, form: ADJUST_FORM_DOM_ID }
        : { onClick: onConfirmKeepingFields })}
    >
      <LoadingSubmitButton isLoading={isLoading}>
        {formatMessage(changeMilestoneStatusModalMessages.changeAction)}
      </LoadingSubmitButton>
    </Button>
  </MilestoneStatusModalFooter>
);

export const BackToTestingStatusModalFooter = ({
  closeModal,
  formatMessage,
  isLoading,
  onConfirm,
}: BackToTestingStatusModalFooterProps) => (
  <MilestoneStatusModalFooter>
    <Button variant="ghost" disabled={isLoading} onClick={closeModal}>
      {formatMessage(COMMON_LOCALE_KEYS.CANCEL)}
    </Button>
    <Button variant="primary" disabled={isLoading} onClick={onConfirm}>
      <LoadingSubmitButton isLoading={isLoading}>
        {formatMessage(changeMilestoneStatusModalMessages.changeAction)}
      </LoadingSubmitButton>
    </Button>
  </MilestoneStatusModalFooter>
);

export const StartTestingSimpleStatusModalFooter = ({
  closeModal,
  formatMessage,
  isLoading,
  onStart,
}: StartTestingSimpleStatusModalFooterProps) => (
  <MilestoneStatusModalFooter>
    <Button variant="ghost" disabled={isLoading} onClick={closeModal}>
      {formatMessage(COMMON_LOCALE_KEYS.CANCEL)}
    </Button>
    <Button variant="primary" disabled={isLoading} onClick={onStart}>
      <LoadingSubmitButton isLoading={isLoading}>
        {formatMessage(changeMilestoneStatusModalMessages.startTestingPrimary)}
      </LoadingSubmitButton>
    </Button>
  </MilestoneStatusModalFooter>
);

export const StartTestingDateChoiceStatusModalFooter = ({
  closeModal,
  formatMessage,
  isLoading,
  onKeepStartDate,
  onStartWithToday,
}: StartTestingDateChoiceStatusModalFooterProps) => (
  <MilestoneStatusModalFooter>
    <Button variant="ghost" disabled={isLoading} onClick={closeModal}>
      {formatMessage(COMMON_LOCALE_KEYS.CANCEL)}
    </Button>
    <Button variant="ghost" disabled={isLoading} onClick={onKeepStartDate}>
      {formatMessage(changeMilestoneStatusModalMessages.startWithoutReplacing)}
    </Button>
    <Button variant="primary" disabled={isLoading} onClick={onStartWithToday}>
      <LoadingSubmitButton isLoading={isLoading}>
        {formatMessage(changeMilestoneStatusModalMessages.startWithToday)}
      </LoadingSubmitButton>
    </Button>
  </MilestoneStatusModalFooter>
);

export const StartTestingNoStartDateStatusModalFooter = ({
  closeModal,
  formatMessage,
  isLoading,
  onStartWithoutDate,
  onStartWithToday,
}: StartTestingNoStartDateStatusModalFooterProps) => (
  <MilestoneStatusModalFooter>
    <Button variant="ghost" disabled={isLoading} onClick={closeModal}>
      {formatMessage(COMMON_LOCALE_KEYS.CANCEL)}
    </Button>
    <Button variant="ghost" disabled={isLoading} onClick={onStartWithoutDate}>
      {formatMessage(changeMilestoneStatusModalMessages.startWithoutDate)}
    </Button>
    <Button variant="primary" disabled={isLoading} onClick={onStartWithToday}>
      <LoadingSubmitButton isLoading={isLoading}>
        {formatMessage(changeMilestoneStatusModalMessages.startWithToday)}
      </LoadingSubmitButton>
    </Button>
  </MilestoneStatusModalFooter>
);

export const CompleteSimpleStatusModalFooter = ({
  closeModal,
  formatMessage,
  isLoading,
  onComplete,
}: CompleteSimpleStatusModalFooterProps) => (
  <MilestoneStatusModalFooter>
    <Button variant="ghost" disabled={isLoading} onClick={closeModal}>
      {formatMessage(COMMON_LOCALE_KEYS.CANCEL)}
    </Button>
    <Button variant="primary" disabled={isLoading} onClick={onComplete}>
      <LoadingSubmitButton isLoading={isLoading}>
        {formatMessage(changeMilestoneStatusModalMessages.completeMilestonePrimary)}
      </LoadingSubmitButton>
    </Button>
  </MilestoneStatusModalFooter>
);

export const CompleteDateChoiceStatusModalFooter = ({
  closeModal,
  formatMessage,
  isLoading,
  onKeepDeadline,
  onCompleteWithToday,
}: CompleteDateChoiceStatusModalFooterProps) => (
  <MilestoneStatusModalFooter>
    <Button variant="ghost" disabled={isLoading} onClick={closeModal}>
      {formatMessage(COMMON_LOCALE_KEYS.CANCEL)}
    </Button>
    <Button variant="ghost" disabled={isLoading} onClick={onKeepDeadline}>
      {formatMessage(changeMilestoneStatusModalMessages.completeWithoutReplacing)}
    </Button>
    <Button variant="primary" disabled={isLoading} onClick={onCompleteWithToday}>
      <LoadingSubmitButton isLoading={isLoading}>
        {formatMessage(changeMilestoneStatusModalMessages.completeWithToday)}
      </LoadingSubmitButton>
    </Button>
  </MilestoneStatusModalFooter>
);

export const CompleteNoDeadlineStatusModalFooter = ({
  closeModal,
  formatMessage,
  isLoading,
  onCompleteWithoutDeadline,
  onCompleteWithToday,
}: CompleteNoDeadlineStatusModalFooterProps) => (
  <MilestoneStatusModalFooter>
    <Button variant="ghost" disabled={isLoading} onClick={closeModal}>
      {formatMessage(COMMON_LOCALE_KEYS.CANCEL)}
    </Button>
    <Button variant="ghost" disabled={isLoading} onClick={onCompleteWithoutDeadline}>
      {formatMessage(changeMilestoneStatusModalMessages.completeWithoutDeadline)}
    </Button>
    <Button variant="primary" disabled={isLoading} onClick={onCompleteWithToday}>
      <LoadingSubmitButton isLoading={isLoading}>
        {formatMessage(changeMilestoneStatusModalMessages.completeWithToday)}
      </LoadingSubmitButton>
    </Button>
  </MilestoneStatusModalFooter>
);

export const createBackToScheduledStatusModalFooter = (
  props: Omit<BackToScheduledStatusModalFooterProps, 'closeModal'>,
) => {
  return (closeModal: () => void) => (
    <BackToScheduledStatusModalFooter {...props} closeModal={closeModal} />
  );
};

export const createBackToTestingStatusModalFooter = (
  props: Omit<BackToTestingStatusModalFooterProps, 'closeModal'>,
) => {
  return (closeModal: () => void) => (
    <BackToTestingStatusModalFooter {...props} closeModal={closeModal} />
  );
};

export const createStartTestingSimpleStatusModalFooter = (
  props: Omit<StartTestingSimpleStatusModalFooterProps, 'closeModal'>,
) => {
  return (closeModal: () => void) => (
    <StartTestingSimpleStatusModalFooter {...props} closeModal={closeModal} />
  );
};

export const createStartTestingDateChoiceStatusModalFooter = (
  props: Omit<StartTestingDateChoiceStatusModalFooterProps, 'closeModal'>,
) => {
  return (closeModal: () => void) => (
    <StartTestingDateChoiceStatusModalFooter {...props} closeModal={closeModal} />
  );
};

export const createStartTestingNoStartDateStatusModalFooter = (
  props: Omit<StartTestingNoStartDateStatusModalFooterProps, 'closeModal'>,
) => {
  return (closeModal: () => void) => (
    <StartTestingNoStartDateStatusModalFooter {...props} closeModal={closeModal} />
  );
};

export const createCompleteSimpleStatusModalFooter = (
  props: Omit<CompleteSimpleStatusModalFooterProps, 'closeModal'>,
) => {
  return (closeModal: () => void) => (
    <CompleteSimpleStatusModalFooter {...props} closeModal={closeModal} />
  );
};

export const createCompleteDateChoiceStatusModalFooter = (
  props: Omit<CompleteDateChoiceStatusModalFooterProps, 'closeModal'>,
) => {
  return (closeModal: () => void) => (
    <CompleteDateChoiceStatusModalFooter {...props} closeModal={closeModal} />
  );
};

export const createCompleteNoDeadlineStatusModalFooter = (
  props: Omit<CompleteNoDeadlineStatusModalFooterProps, 'closeModal'>,
) => {
  return (closeModal: () => void) => (
    <CompleteNoDeadlineStatusModalFooter {...props} closeModal={closeModal} />
  );
};
