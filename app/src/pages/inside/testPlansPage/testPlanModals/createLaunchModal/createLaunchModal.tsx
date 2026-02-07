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

import { FormEvent, MouseEvent, useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { InjectedFormProps, reduxForm } from 'redux-form';
import { Modal } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { hideModalAction } from 'controllers/modal';
import { commonValidators } from 'common/utils/validation';
import { ModalLoadingOverlay } from 'components/modalLoadingOverlay';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';
import { useActiveTestPlan } from 'hooks/useTypedSelector';
import {
  LaunchFormFields,
  LaunchFormData,
  INITIAL_LAUNCH_FORM_VALUES,
  useCreateManualLaunch,
  isLaunchObject,
  LaunchMode,
} from 'pages/inside/common/launchFormFields';

import { CreateLaunchModalProps } from './types';
import { messages } from './messages';

import styles from './createLaunchModal.scss';

const cx = createClassnames(styles);

const CreateLaunchModalComponent = ({
  dirty,
  pristine,
  invalid,
  handleSubmit,
  testCases,
  initialize,
}: CreateLaunchModalProps & InjectedFormProps<LaunchFormData>) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const activeTestPlan = useActiveTestPlan();
  const [activeMode, setActiveMode] = useState<LaunchMode>(LaunchMode.EXISTING);
  const [selectedLaunch, setSelectedLaunch] = useState<{ id: number; name: string } | null>(null);

  const testPlanName = activeTestPlan?.name;
  const testPlanId = activeTestPlan?.id || 0;

  const { handleSubmit: handleCreateLaunch, isLoading } = useCreateManualLaunch(
    testCases,
    testPlanId,
    activeMode,
    selectedLaunch?.id,
  );

  const isSubmitDisabled = isLoading || pristine || invalid;

  const okButton = {
    children: (
      <LoadingSubmitButton isLoading={isLoading}>
        {formatMessage(COMMON_LOCALE_KEYS.CREATE)}
      </LoadingSubmitButton>
    ),
    onClick: handleSubmit(handleCreateLaunch) as (event: MouseEvent<HTMLButtonElement>) => void,
    disabled: isSubmitDisabled,
  };

  const cancelButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    disabled: isLoading,
  };

  useEffect(() => {
    initialize({
      name: '',
      description: '',
      attributes: [],
      uncoveredTestsOnly: false,
    });
  }, [activeMode, initialize]);

  return (
    <Modal
      title={formatMessage(messages.addToLaunch)}
      okButton={okButton}
      className={cx('create-launch-modal')}
      cancelButton={cancelButton}
      allowCloseOutside={!dirty}
      onClose={() => dispatch(hideModalAction())}
    >
      <div className={cx('create-launch-modal__content-wrapper')}>
        <form onSubmit={handleSubmit(handleCreateLaunch) as (event: FormEvent) => void}>
          <div className={cx('create-launch-modal__container')}>
            <LaunchFormFields
              testPlanName={testPlanName}
              activeMode={activeMode}
              onModeChange={setActiveMode}
              onLaunchSelect={setSelectedLaunch}
            />
          </div>
        </form>
        <ModalLoadingOverlay isVisible={isLoading} />
      </div>
    </Modal>
  );
};

const validate = ({ name, attributes }: LaunchFormData) => {
  const errors: Record<string, string> = {};

  // Validate name: string (NEW mode) or object with id (EXISTING mode)
  if (typeof name === 'string') {
    const error = commonValidators.requiredField(name);
    if (error) errors.name = error;
  } else if (!isLaunchObject(name)) {
    errors.name = 'This field is required';
  }

  if (attributes && attributes.length > 0) {
    const hasInvalidAttribute = attributes.some((attr) => attr.value && !attr.key);
    if (hasInvalidAttribute) {
      errors.attributes = 'Key cannot be empty';
    }
  }

  return errors;
};

export const CreateLaunchModal = reduxForm<LaunchFormData, CreateLaunchModalProps>({
  form: 'create-launch-modal-form',
  validate,
  destroyOnUnmount: true,
  shouldValidate: () => true,
  initialValues: INITIAL_LAUNCH_FORM_VALUES,
})(CreateLaunchModalComponent);
