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

import type { ComponentType, JSX } from 'react';
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

type MilestoneStatusModalFooterBaseProps = {
  closeModal: () => void;
  formatMessage: FormatMessageFn;
  isLoading: boolean;
};

type BackToScheduledStatusModalFooterProps = MilestoneStatusModalFooterBaseProps & {
  adjustMilestone: boolean;
  isAdjustChangeDisabled: boolean;
  onConfirmKeepingFields: () => void;
};

type BackToTestingStatusModalFooterProps = MilestoneStatusModalFooterBaseProps & {
  onConfirm: () => void;
};

type StartTestingSimpleStatusModalFooterProps = MilestoneStatusModalFooterBaseProps & {
  onStart: () => void;
};

type StartTestingDateChoiceStatusModalFooterProps = MilestoneStatusModalFooterBaseProps & {
  onKeepStartDate: () => void;
  onStartWithToday: () => void;
};

type StartTestingNoStartDateStatusModalFooterProps = MilestoneStatusModalFooterBaseProps & {
  onStartWithoutDate: () => void;
  onStartWithToday: () => void;
};

type CompleteSimpleStatusModalFooterProps = MilestoneStatusModalFooterBaseProps & {
  onComplete: () => void;
};

type CompleteDateChoiceStatusModalFooterProps = MilestoneStatusModalFooterBaseProps & {
  onKeepDeadline: () => void;
  onCompleteWithToday: () => void;
};

type CompleteNoDeadlineStatusModalFooterProps = MilestoneStatusModalFooterBaseProps & {
  onCompleteWithoutDeadline: () => void;
  onCompleteWithToday: () => void;
};

const MilestoneModalCancelButton = ({
  closeModal,
  formatMessage,
  isLoading,
}: Pick<MilestoneStatusModalFooterBaseProps, 'closeModal' | 'formatMessage' | 'isLoading'>) => (
  <Button variant="ghost" disabled={isLoading} onClick={closeModal}>
    {formatMessage(COMMON_LOCALE_KEYS.CANCEL)}
  </Button>
);

const MilestoneModalGhostTextButton = ({
  isLoading,
  onClick,
  formatMessage,
  message,
}: {
  isLoading: boolean;
  onClick: () => void;
  formatMessage: FormatMessageFn;
  message: MessageDescriptor;
}) => (
  <Button variant="ghost" disabled={isLoading} onClick={onClick}>
    {formatMessage(message)}
  </Button>
);

const MilestoneModalPrimaryLoadingButton = ({
  isLoading,
  onClick,
  formatMessage,
  message,
}: {
  isLoading: boolean;
  onClick: () => void;
  formatMessage: FormatMessageFn;
  message: MessageDescriptor;
}) => (
  <Button variant="primary" disabled={isLoading} onClick={onClick}>
    <LoadingSubmitButton isLoading={isLoading}>
      {formatMessage(message)}
    </LoadingSubmitButton>
  </Button>
);

const BackToScheduledStatusModalFooter = ({
  closeModal,
  formatMessage,
  isLoading,
  adjustMilestone,
  isAdjustChangeDisabled,
  onConfirmKeepingFields,
}: BackToScheduledStatusModalFooterProps) => (
  <MilestoneStatusModalFooter>
    <MilestoneModalCancelButton closeModal={closeModal} formatMessage={formatMessage} isLoading={isLoading} />
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

const BackToTestingStatusModalFooter = ({
  closeModal,
  formatMessage,
  isLoading,
  onConfirm,
}: BackToTestingStatusModalFooterProps) => (
  <MilestoneStatusModalFooter>
    <MilestoneModalCancelButton closeModal={closeModal} formatMessage={formatMessage} isLoading={isLoading} />
    <MilestoneModalPrimaryLoadingButton
      isLoading={isLoading}
      onClick={onConfirm}
      formatMessage={formatMessage}
      message={changeMilestoneStatusModalMessages.changeAction}
    />
  </MilestoneStatusModalFooter>
);

const StartTestingSimpleStatusModalFooter = ({
  closeModal,
  formatMessage,
  isLoading,
  onStart,
}: StartTestingSimpleStatusModalFooterProps) => (
  <MilestoneStatusModalFooter>
    <MilestoneModalCancelButton closeModal={closeModal} formatMessage={formatMessage} isLoading={isLoading} />
    <MilestoneModalPrimaryLoadingButton
      isLoading={isLoading}
      onClick={onStart}
      formatMessage={formatMessage}
      message={changeMilestoneStatusModalMessages.startTestingPrimary}
    />
  </MilestoneStatusModalFooter>
);

const StartTestingDateChoiceStatusModalFooter = ({
  closeModal,
  formatMessage,
  isLoading,
  onKeepStartDate,
  onStartWithToday,
}: StartTestingDateChoiceStatusModalFooterProps) => (
  <MilestoneStatusModalFooter>
    <MilestoneModalCancelButton closeModal={closeModal} formatMessage={formatMessage} isLoading={isLoading} />
    <MilestoneModalGhostTextButton
      isLoading={isLoading}
      onClick={onKeepStartDate}
      formatMessage={formatMessage}
      message={changeMilestoneStatusModalMessages.startWithoutReplacing}
    />
    <MilestoneModalPrimaryLoadingButton
      isLoading={isLoading}
      onClick={onStartWithToday}
      formatMessage={formatMessage}
      message={changeMilestoneStatusModalMessages.startWithToday}
    />
  </MilestoneStatusModalFooter>
);

const StartTestingNoStartDateStatusModalFooter = ({
  closeModal,
  formatMessage,
  isLoading,
  onStartWithoutDate,
  onStartWithToday,
}: StartTestingNoStartDateStatusModalFooterProps) => (
  <MilestoneStatusModalFooter>
    <MilestoneModalCancelButton closeModal={closeModal} formatMessage={formatMessage} isLoading={isLoading} />
    <MilestoneModalGhostTextButton
      isLoading={isLoading}
      onClick={onStartWithoutDate}
      formatMessage={formatMessage}
      message={changeMilestoneStatusModalMessages.startWithoutDate}
    />
    <MilestoneModalPrimaryLoadingButton
      isLoading={isLoading}
      onClick={onStartWithToday}
      formatMessage={formatMessage}
      message={changeMilestoneStatusModalMessages.startWithToday}
    />
  </MilestoneStatusModalFooter>
);

const CompleteSimpleStatusModalFooter = ({
  closeModal,
  formatMessage,
  isLoading,
  onComplete,
}: CompleteSimpleStatusModalFooterProps) => (
  <MilestoneStatusModalFooter>
    <MilestoneModalCancelButton closeModal={closeModal} formatMessage={formatMessage} isLoading={isLoading} />
    <MilestoneModalPrimaryLoadingButton
      isLoading={isLoading}
      onClick={onComplete}
      formatMessage={formatMessage}
      message={changeMilestoneStatusModalMessages.completeMilestonePrimary}
    />
  </MilestoneStatusModalFooter>
);

const CompleteDateChoiceStatusModalFooter = ({
  closeModal,
  formatMessage,
  isLoading,
  onKeepDeadline,
  onCompleteWithToday,
}: CompleteDateChoiceStatusModalFooterProps) => (
  <MilestoneStatusModalFooter>
    <MilestoneModalCancelButton closeModal={closeModal} formatMessage={formatMessage} isLoading={isLoading} />
    <MilestoneModalGhostTextButton
      isLoading={isLoading}
      onClick={onKeepDeadline}
      formatMessage={formatMessage}
      message={changeMilestoneStatusModalMessages.completeWithoutReplacing}
    />
    <MilestoneModalPrimaryLoadingButton
      isLoading={isLoading}
      onClick={onCompleteWithToday}
      formatMessage={formatMessage}
      message={changeMilestoneStatusModalMessages.completeWithToday}
    />
  </MilestoneStatusModalFooter>
);

const CompleteNoDeadlineStatusModalFooter = ({
  closeModal,
  formatMessage,
  isLoading,
  onCompleteWithoutDeadline,
  onCompleteWithToday,
}: CompleteNoDeadlineStatusModalFooterProps) => (
  <MilestoneStatusModalFooter>
    <MilestoneModalCancelButton closeModal={closeModal} formatMessage={formatMessage} isLoading={isLoading} />
    <MilestoneModalGhostTextButton
      isLoading={isLoading}
      onClick={onCompleteWithoutDeadline}
      formatMessage={formatMessage}
      message={changeMilestoneStatusModalMessages.completeWithoutDeadline}
    />
    <MilestoneModalPrimaryLoadingButton
      isLoading={isLoading}
      onClick={onCompleteWithToday}
      formatMessage={formatMessage}
      message={changeMilestoneStatusModalMessages.completeWithToday}
    />
  </MilestoneStatusModalFooter>
);

type WithoutCloseModal<T> = Omit<T, 'closeModal'>;

export const createModalFooter =
  <TProps extends { closeModal: () => void }>(Component: ComponentType<TProps>) =>
  (props: WithoutCloseModal<TProps>) =>
  (closeModal: () => void): JSX.Element =>
    <Component {...(props as TProps)} closeModal={closeModal} />;

export const createBackToScheduledStatusModalFooter = createModalFooter(BackToScheduledStatusModalFooter);

export const createBackToTestingStatusModalFooter = createModalFooter(BackToTestingStatusModalFooter);

export const createStartTestingSimpleStatusModalFooter = createModalFooter(
  StartTestingSimpleStatusModalFooter,
);

export const createStartTestingDateChoiceStatusModalFooter = createModalFooter(
  StartTestingDateChoiceStatusModalFooter,
);

export const createStartTestingNoStartDateStatusModalFooter = createModalFooter(
  StartTestingNoStartDateStatusModalFooter,
);

export const createCompleteSimpleStatusModalFooter = createModalFooter(CompleteSimpleStatusModalFooter);

export const createCompleteDateChoiceStatusModalFooter = createModalFooter(
  CompleteDateChoiceStatusModalFooter,
);

export const createCompleteNoDeadlineStatusModalFooter = createModalFooter(
  CompleteNoDeadlineStatusModalFooter,
);
