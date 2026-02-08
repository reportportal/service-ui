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

import { FormEvent, MouseEvent, useState, useEffect, useMemo, ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { InjectedFormProps, reduxForm } from 'redux-form';
import { Modal } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { hideModalAction } from 'controllers/modal';
import { commonValidators } from 'common/utils/validation';
import { ModalLoadingOverlay } from 'components/modalLoadingOverlay';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';
import { testCasesSelector } from 'controllers/testCase';
import {
  LaunchFormFields,
  LaunchFormData,
  INITIAL_LAUNCH_FORM_VALUES,
  useCreateManualLaunch,
  isLaunchObject,
  LaunchMode,
  LaunchOption,
  TestPlanOption,
} from 'pages/inside/common/launchFormFields';

import { AddToLaunchModalV2Props } from './types';
import { messages } from './messages';

import styles from './addToLaunchModalV2.scss';

const cx = createClassnames(styles);

const AddToLaunchModalV2Component = ({
  dirty,
  pristine,
  invalid,
  handleSubmit,
  selectedRowsIds,
  initialize,
}: AddToLaunchModalV2Props & InjectedFormProps<LaunchFormData>) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const allTestCases = useSelector(testCasesSelector);
  const [activeMode, setActiveMode] = useState<LaunchMode>(LaunchMode.EXISTING);
  const [selectedLaunch, setSelectedLaunch] = useState<LaunchOption | null>(null);
  const [selectedTestPlan, setSelectedTestPlan] = useState<TestPlanOption | null>(null);

  const testCases = useMemo(() => {
    return allTestCases.filter((tc) => selectedRowsIds.includes(tc.id));
  }, [allTestCases, selectedRowsIds]);

  const { handleSubmit: handleCreateLaunch, isLoading } = useCreateManualLaunch(
    testCases,
    selectedTestPlan?.id,
    activeMode,
    selectedLaunch?.id,
  );

  const isSubmitDisabled = isLoading || pristine || invalid;

  const okButton = {
    children: (
      <LoadingSubmitButton isLoading={isLoading}>
        {formatMessage(COMMON_LOCALE_KEYS.ADD)}
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

  const descriptionText = useMemo(() => {
    return formatMessage(messages.addSelectedTestCases, {
      count: selectedRowsIds.length,
      bold: (value: ReactNode) => <b className={cx('selected-test-cases')}>{value}</b>,
    });
  }, [selectedRowsIds.length, formatMessage]);

  return (
    <Modal
      title={formatMessage(messages.addToLaunch)}
      okButton={okButton}
      className={cx('add-to-launch-modal-v2')}
      cancelButton={cancelButton}
      allowCloseOutside={!dirty}
      onClose={() => dispatch(hideModalAction())}
    >
      <div className={cx('add-to-launch-modal-v2__content-wrapper')}>
        <form onSubmit={handleSubmit(handleCreateLaunch) as (event: FormEvent) => void}>
          <div className={cx('add-to-launch-modal-v2__container')}>
            <LaunchFormFields
              activeMode={activeMode}
              onModeChange={setActiveMode}
              onLaunchSelect={setSelectedLaunch}
              onTestPlanChange={setSelectedTestPlan}
              description={descriptionText}
              isTestPlanFieldDisabled={false}
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

export const AddToLaunchModalV2 = reduxForm<LaunchFormData, AddToLaunchModalV2Props>({
  form: 'add-to-launch-modal-v2-form',
  validate,
  destroyOnUnmount: true,
  shouldValidate: () => true,
  initialValues: INITIAL_LAUNCH_FORM_VALUES,
})(AddToLaunchModalV2Component);
