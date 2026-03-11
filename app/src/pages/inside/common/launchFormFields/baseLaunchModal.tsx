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

import { FormEvent, MouseEvent, useState, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { InjectedFormProps } from 'redux-form';
import { Modal } from '@reportportal/ui-kit';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { hideModalAction } from 'controllers/modal';
import { ModalLoadingOverlay } from 'components/modalLoadingOverlay';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';

import { LaunchFormFields } from './launchFormFields';
import { LaunchFormData, LaunchMode, LaunchOption, BaseLaunchModalProps } from './types';
import { useCreateManualLaunch } from './useCreateManualLaunch';

export const BaseLaunchModal = ({
  dirty,
  pristine,
  invalid,
  handleSubmit,
  change,
  testCases,
  testPlanId,
  modalTitle,
  okButtonText,
  description,
  isUncoveredTestsCheckboxAvailable,
  hideTestPlanField = false,
  className,
  onClearSelection,
}: BaseLaunchModalProps & InjectedFormProps<LaunchFormData>) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const [activeMode, setActiveMode] = useState<LaunchMode>(LaunchMode.EXISTING);
  const [selectedLaunch, setSelectedLaunch] = useState<LaunchOption | null>(null);

  const { handleSubmit: handleCreateLaunch, isLoading } = useCreateManualLaunch(
    testCases,
    activeMode,
    hideTestPlanField ? null : testPlanId,
    selectedLaunch?.id,
    onClearSelection,
  );

  const isSubmitDisabled =
    isLoading || invalid || (activeMode === LaunchMode.EXISTING ? !selectedLaunch : pristine);

  const handleModeChange = useCallback(
    (mode: LaunchMode) => {
      if (mode !== activeMode) {
        setActiveMode(mode);
        setSelectedLaunch(null);
        // Clear the name field when switching modes to prevent type conflicts
        change('name', mode === LaunchMode.NEW ? '' : null);
        // Reset uncoveredTestsOnly checkbox when switching modes
        change('uncoveredTestsOnly', false);
      }
    },
    [activeMode, change],
  );

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

  return (
    <Modal
      title={modalTitle}
      okButton={okButton}
      className={className}
      cancelButton={cancelButton}
      allowCloseOutside={!dirty}
      onClose={() => dispatch(hideModalAction())}
    >
      <div className={className ? `${className}__content-wrapper` : undefined}>
        <form onSubmit={handleSubmit(handleCreateLaunch) as (event: FormEvent) => void}>
          <div className={className ? `${className}__container` : undefined}>
            <LaunchFormFields
              activeMode={activeMode}
              onModeChange={handleModeChange}
              onLaunchSelect={setSelectedLaunch}
              description={description}
              isUncoveredTestsCheckboxAvailable={isUncoveredTestsCheckboxAvailable}
              hideTestPlanField={hideTestPlanField}
            />
          </div>
        </form>
        <ModalLoadingOverlay isVisible={isLoading} />
      </div>
    </Modal>
  );
};
