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

import { FormEvent, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { Field, InjectedFormProps, formValueSelector, reduxForm } from 'redux-form';
import { Modal, FieldText } from '@reportportal/ui-kit';
import { VoidFn } from '@reportportal/ui-kit/common';

import { createClassnames } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { MilestoneStatus, TmsMilestoneType } from 'controllers/milestone';
import { useModalButtons } from 'hooks/useModalButtons';
import { FieldErrorHint, FieldProvider } from 'components/fields';
import { ModalLoadingOverlay } from 'components/modalLoadingOverlay';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';

import { CREATE_MILESTONE_FORM_NAME, INITIAL_MILESTONE_FORM_VALUES, NAME_FIELD } from './constants';
import { createMilestoneModalMessages } from './messages';
import {
  endDateDaysAfterStart,
  endDateMonthsAfterStart,
  nextMondayDateOnly,
  tomorrowDateOnly,
} from '../../datePickerConstants';
import { MilestoneDateShortcutRow } from '../../milestoneDateShortcutRow/milestoneDateShortcutRow';
import { MilestoneDateField } from '../../milestoneDateField/milestoneDateField';
import { MilestoneTypeDropdown } from '../../milestoneTypeDropdown/milestoneTypeDropdown';
import type { MilestoneFormValues } from './types';
import { useCreateMilestone } from './useCreateMilestone';
import { validateMilestoneForm } from './validateMilestoneForm';

import styles from './createMilestoneModal.scss';

const cx = createClassnames(styles);

export type { MilestoneFormValues } from './types';
export { CREATE_MILESTONE_MODAL_KEY } from './constants';

type FormProps = InjectedFormProps<MilestoneFormValues>;

const milestoneFormValues = formValueSelector(CREATE_MILESTONE_FORM_NAME);

const CreateMilestoneModalComponent = ({ handleSubmit, invalid, dirty, change }: FormProps) => {
  const { formatMessage } = useIntl();
  const { isLoading, submitMilestone } = useCreateMilestone();
  const startDate = useSelector(
    (state) => milestoneFormValues(state, 'startDate') as string | undefined,
  );

  const startDateShortcuts = useMemo(
    () => [
      {
        id: 'tomorrow',
        label: formatMessage(createMilestoneModalMessages.dateShortcutTomorrow),
        onClick: () => change('startDate', tomorrowDateOnly()),
      },
      {
        id: 'nextMonday',
        label: formatMessage(createMilestoneModalMessages.dateShortcutNextMonday),
        onClick: () => change('startDate', nextMondayDateOnly()),
      },
    ],
    [change, formatMessage],
  );

  const endDateShortcuts = useMemo(
    () => [
      {
        id: 'week',
        label: formatMessage(createMilestoneModalMessages.dateShortcutWeek),
        onClick: () => change('endDate', endDateDaysAfterStart(startDate, 7)),
      },
      {
        id: 'twoWeeks',
        label: formatMessage(createMilestoneModalMessages.dateShortcutTwoWeeks),
        onClick: () => change('endDate', endDateDaysAfterStart(startDate, 14)),
      },
      {
        id: 'oneMonth',
        label: formatMessage(createMilestoneModalMessages.dateShortcutOneMonth),
        onClick: () => change('endDate', endDateMonthsAfterStart(startDate, 1)),
      },
    ],
    [change, formatMessage, startDate],
  );

  const onSubmit = (values: MilestoneFormValues) =>
    submitMilestone({
      name: values.name.trim(),
      type: values.type as TmsMilestoneType,
      status: MilestoneStatus.SCHEDULED,
      startDate: new Date(values.startDate).toISOString(),
      endDate: new Date(values.endDate).toISOString(),
    });

  const { okButton, cancelButton, hideModal } = useModalButtons({
    okButtonText: (
      <LoadingSubmitButton isLoading={isLoading}>
        {formatMessage(COMMON_LOCALE_KEYS.CREATE)}
      </LoadingSubmitButton>
    ),
    isLoading,
    isSubmitButtonDisabled: invalid,
    onSubmit: handleSubmit(onSubmit) as VoidFn,
  });

  return (
    <Modal
      title={formatMessage(createMilestoneModalMessages.createMilestoneModalTitle)}
      okButton={okButton}
      className={cx('create-milestone-modal')}
      cancelButton={cancelButton}
      allowCloseOutside={!dirty}
      onClose={hideModal}
    >
      <div className={cx('create-milestone-modal__content')}>
        <ModalLoadingOverlay isVisible={isLoading} />
        <form onSubmit={handleSubmit(onSubmit) as (event: FormEvent) => void}>
          <div className={cx('create-milestone-modal__field')}>
            <FieldProvider
              name={NAME_FIELD}
              placeholder={formatMessage(createMilestoneModalMessages.milestoneNamePlaceholder)}
            >
              <FieldErrorHint provideHint={false}>
                <FieldText
                  label={formatMessage(COMMON_LOCALE_KEYS.NAME)}
                  defaultWidth={false}
                  isRequired
                />
              </FieldErrorHint>
            </FieldProvider>
          </div>

          <div className={cx('create-milestone-modal__field')}>
            <Field
              name="type"
              component={MilestoneTypeDropdown}
              props={{ label: formatMessage(createMilestoneModalMessages.typeLabel) }}
            />
          </div>

          <div className={cx('create-milestone-modal__dates')}>
            <div className={cx('create-milestone-modal__field')}>
              <Field
                name="startDate"
                component={MilestoneDateField}
                props={{
                  label: formatMessage(createMilestoneModalMessages.startDateLabel),
                  placeholder: formatMessage(createMilestoneModalMessages.dateFieldPlaceholder),
                  disabled: isLoading,
                  shortcutSlot: (
                    <MilestoneDateShortcutRow items={startDateShortcuts} disabled={isLoading} />
                  ),
                }}
              />
            </div>
            <div className={cx('create-milestone-modal__field')}>
              <Field
                name="endDate"
                component={MilestoneDateField}
                props={{
                  label: formatMessage(createMilestoneModalMessages.endDateLabel),
                  placeholder: formatMessage(createMilestoneModalMessages.dateFieldPlaceholder),
                  disabled: isLoading,
                  shortcutSlot: (
                    <MilestoneDateShortcutRow items={endDateShortcuts} disabled={isLoading} />
                  ),
                }}
              />
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export const CreateMilestoneModal = reduxForm<MilestoneFormValues>({
  form: CREATE_MILESTONE_FORM_NAME,
  initialValues: INITIAL_MILESTONE_FORM_VALUES,
  validate: validateMilestoneForm,
})(CreateMilestoneModalComponent);
