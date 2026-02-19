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
import { InjectedFormProps, reduxForm } from 'redux-form';
import { useMemo, ReactNode } from 'react';

import { createClassnames } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { useActiveTestPlan } from 'hooks/useTypedSelector';
import {
  BaseLaunchModal,
  LaunchFormData,
  INITIAL_LAUNCH_FORM_VALUES,
  messages as launchFormMessages,
} from 'pages/inside/common/launchFormFields';

import { CreateLaunchModalProps } from './types';
import { messages } from './messages';

import styles from './createLaunchModal.scss';

const cx = createClassnames(styles);

const BoldTestPlanName = (parts: ReactNode[]) => <b className={cx('test-plan-name')}>{parts}</b>;

const CreateLaunchModalComponent = ({
  testCases,
  ...reduxFormProps
}: CreateLaunchModalProps & InjectedFormProps<LaunchFormData>) => {
  const { formatMessage } = useIntl();
  const activeTestPlan = useActiveTestPlan();

  const testPlanName = activeTestPlan?.name;
  const testPlanId = activeTestPlan?.id;

  const descriptionText = useMemo(() => {
    return formatMessage(launchFormMessages.addTestCasesFromTestPlan, {
      testPlanName: testPlanName || '',
      bold: BoldTestPlanName,
    });
  }, [testPlanName, formatMessage]);

  return (
    <BaseLaunchModal
      {...reduxFormProps}
      testCases={testCases}
      testPlanId={testPlanId}
      modalTitle={formatMessage(messages.addToLaunch)}
      okButtonText={COMMON_LOCALE_KEYS.ADD}
      description={descriptionText}
      hideTestPlanField
      isUncoveredTestsCheckboxAvailable={false}
      className={cx('create-launch-modal')}
    />
  );
};

export const CreateLaunchModal = reduxForm<LaunchFormData, CreateLaunchModalProps>({
  form: 'create-launch-modal-form',
  destroyOnUnmount: true,
  initialValues: INITIAL_LAUNCH_FORM_VALUES,
})(CreateLaunchModalComponent);
