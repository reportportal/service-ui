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
import { InjectedFormProps } from 'redux-form';
import { Modal } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { hideModalAction } from 'controllers/modal';
import { ModalLoadingOverlay } from 'components/modalLoadingOverlay';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';

import { LaunchFormFields } from './launchFormFields';
import {
  LaunchFormData,
  LaunchMode,
  LaunchOption,
  TestPlanOption,
  BaseLaunchModalProps,
} from './types';
import { useCreateManualLaunch } from './useCreateManualLaunch';

export const BaseLaunchModal = ({
  dirty,
  pristine,
  invalid,
  handleSubmit,
  initialize,
  testCases,
  testPlanId,
  testPlanName,
  modalTitle,
  okButtonText,
  description,
  isTestPlanFieldDisabled = true,
  className,
  onClearSelection,
}: BaseLaunchModalProps & InjectedFormProps<LaunchFormData>) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const [activeMode, setActiveMode] = useState<LaunchMode>(LaunchMode.EXISTING);
  const [selectedLaunch, setSelectedLaunch] = useState<LaunchOption | null>(null);
  const [selectedTestPlan, setSelectedTestPlan] = useState<TestPlanOption | null>(null);

  const { handleSubmit: handleCreateLaunch, isLoading } = useCreateManualLaunch(
    testCases,
    activeMode,
    testPlanId ?? selectedTestPlan?.id,
    selectedLaunch?.id,
    onClearSelection,
  );

  const isSubmitDisabled = isLoading || pristine || invalid;

  const okButton = {
    children: (
      <LoadingSubmitButton isLoading={isLoading}>{formatMessage(okButtonText)}</LoadingSubmitButton>
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

  const cx = createClassnames({ [className || '']: true });

  return (
    <Modal
      title={modalTitle}
      okButton={okButton}
      className={cx(className)}
      cancelButton={cancelButton}
      allowCloseOutside={!dirty}
      onClose={() => dispatch(hideModalAction())}
    >
      <div className={cx(`${className}__content-wrapper`)}>
        <form onSubmit={handleSubmit(handleCreateLaunch) as (event: FormEvent) => void}>
          <div className={cx(`${className}__container`)}>
            <LaunchFormFields
              testPlanName={testPlanName}
              activeMode={activeMode}
              onModeChange={setActiveMode}
              onLaunchSelect={setSelectedLaunch}
              onTestPlanChange={setSelectedTestPlan}
              description={description}
              isTestPlanFieldDisabled={isTestPlanFieldDisabled}
            />
          </div>
        </form>
        <ModalLoadingOverlay isVisible={isLoading} />
      </div>
    </Modal>
  );
};
