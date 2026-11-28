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

import { useMemo, FC, useRef } from 'react';
import { useIntl } from 'react-intl';
import { useTracking } from 'react-tracking';
import { useSelector } from 'react-redux';
import { reduxForm, InjectedFormProps, formValueSelector } from 'redux-form';
import { Modal, SystemMessage } from '@reportportal/ui-kit';
import { noop } from 'es-toolkit';
import { VoidFn } from '@reportportal/ui-kit/common';

import { createClassnames } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { INCOMPLETE_ATTRIBUTE_ERROR } from 'common/utils/validation/constants';
import { useTextareaAutoResize } from 'common/hooks';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';
import {
  LaunchFormData,
  Attribute,
  TestPlanOption,
} from 'pages/inside/common/launchFormFields/types';
import { NewLaunchFields } from 'pages/inside/common/launchFormFields/newLaunchFields';
import { LAUNCH_FORM_FIELD_NAMES } from 'pages/inside/common/launchFormFields/constants';
import { useModalButtons } from 'hooks/useModalButtons';
import { MANUAL_LAUNCHES_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/manualLaunchesPageEvents';

import { useEditManualLaunch } from './useEditManualLaunch';
import { EditManualLaunchModalProps } from './types';
import { messages } from './messages';
import { EDIT_MANUAL_LAUNCH_FORM } from './constants';
import { getTestPlanChange, TestPlanChange } from './utils';
import { useTestPlanWithMilestone } from './useTestPlanWithMilestone';

import styles from './editManualLaunchModal.scss';

const cx = createClassnames(styles);

const selectFormValue = formValueSelector(EDIT_MANUAL_LAUNCH_FORM);

const TEST_PLAN_CHANGE_MESSAGES = {
  [TestPlanChange.CHANGED]: {
    title: messages.testPlanChangedTitle,
    text: messages.testPlanChangedWarning,
  },
  [TestPlanChange.REMOVED]: {
    title: messages.testPlanRemovedTitle,
    text: messages.testPlanRemovedWarning,
  },
};

const EditManualLaunchModalComponent = ({
  data,
  onSuccess = noop,
  handleSubmit,
  invalid,
  pristine,
  dirty,
}: EditManualLaunchModalProps & InjectedFormProps<LaunchFormData, EditManualLaunchModalProps>) => {
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const descriptionRef = useRef<HTMLTextAreaElement | null>(null);

  useTextareaAutoResize(descriptionRef);

  const selectedTestPlan = useSelector(
    (state) => selectFormValue(state, LAUNCH_FORM_FIELD_NAMES.TEST_PLAN) as TestPlanOption | null,
  );
  const testPlanChange = getTestPlanChange(data.testPlan, selectedTestPlan);
  const testPlanNotice = testPlanChange ? (
    <SystemMessage
      mode="warning"
      header={formatMessage(TEST_PLAN_CHANGE_MESSAGES[testPlanChange].title)}
    >
      {formatMessage(TEST_PLAN_CHANGE_MESSAGES[testPlanChange].text)}
    </SystemMessage>
  ) : null;

  const { handleSubmit: handleEditLaunch, isLoading } = useEditManualLaunch({
    launchId: data.id,
    onSuccess,
  });

  const onSubmit = useMemo(
    () => (formValues: LaunchFormData) => {
      trackEvent(MANUAL_LAUNCHES_PAGE_EVENTS.SUBMIT_EDIT_LAUNCH);
      handleEditLaunch(formValues).catch(noop);
    },
    [handleEditLaunch, trackEvent],
  );

  const { okButton, cancelButton, hideModal } = useModalButtons({
    okButtonText: (
      <LoadingSubmitButton isLoading={isLoading}>
        {formatMessage(COMMON_LOCALE_KEYS.SAVE)}
      </LoadingSubmitButton>
    ),
    isLoading,
    isSubmitButtonDisabled: invalid || pristine,
    onSubmit: handleSubmit(onSubmit) as VoidFn,
  });

  return (
    <Modal
      title={formatMessage(messages.editLaunch)}
      okButton={okButton}
      cancelButton={cancelButton}
      allowCloseOutside={!dirty}
      onClose={hideModal}
      className={cx('edit-manual-launch-modal')}
      scrollable
    >
      <form
        onSubmit={handleSubmit(onSubmit) as (event: React.FormEvent) => void}
        className={cx('edit-manual-launch-modal__form')}
      >
        <NewLaunchFields
          hideTestPlanField={false}
          descriptionPlaceholder={formatMessage(messages.descriptionPlaceholder)}
          testPlanPlaceholder={formatMessage(messages.testPlanPlaceholder)}
          descriptionRef={descriptionRef}
          testPlanMenuClassName="test-plan-dropdown"
          testPlanNotice={testPlanNotice}
          autocompleteProps={{
            useFixedPositioning: true,
            keyMenuClassName: 'attribute-key-dropdown',
            valueMenuClassName: 'attribute-value-dropdown',
          }}
        />
      </form>
    </Modal>
  );
};

const EditManualLaunchModalReduxForm = reduxForm<LaunchFormData, EditManualLaunchModalProps>({
  form: EDIT_MANUAL_LAUNCH_FORM,
  destroyOnUnmount: true,
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
  validate: (values) => {
    const errors: Partial<Record<keyof LaunchFormData, string>> = {};

    // Disable Save button if any attribute is being edited (incomplete)
    if (Array.isArray(values.attributes)) {
      const hasIncompleteAttribute = values.attributes.some((attr: Attribute) => attr.edited);
      if (hasIncompleteAttribute) {
        errors.attributes = INCOMPLETE_ATTRIBUTE_ERROR;
      }
    }

    return errors;
  },
})(EditManualLaunchModalComponent);

export const EditManualLaunchModal: FC<EditManualLaunchModalProps> = (props) => {
  const initialTestPlan = useTestPlanWithMilestone(props.data.testPlan);
  const initialValues = useMemo(
    () => ({
      [LAUNCH_FORM_FIELD_NAMES.NAME]: props.data.name,
      [LAUNCH_FORM_FIELD_NAMES.DESCRIPTION]: props.data.description || '',
      [LAUNCH_FORM_FIELD_NAMES.TEST_PLAN]: initialTestPlan,
      [LAUNCH_FORM_FIELD_NAMES.ATTRIBUTES]: props.data.attributes || [],
    }),
    [props.data, initialTestPlan],
  );

  return <EditManualLaunchModalReduxForm {...props} initialValues={initialValues} />;
};
