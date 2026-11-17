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

import { useMemo, ReactNode, useCallback } from 'react';
import { useIntl } from 'react-intl';
import { InjectedFormProps, reduxForm } from 'redux-form';
import { useTracking } from 'react-tracking';

import { createClassnames } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { useActiveTestPlan } from 'hooks/useTypedSelector';
import { BULK_ADD_TO_LAUNCH_MIN_SELECTION } from 'pages/inside/common/constants';
import {
  BaseLaunchModal,
  LaunchFormData,
  INITIAL_LAUNCH_FORM_VALUES,
  LaunchMode,
  messages as launchFormMessages,
} from 'pages/inside/common/launchFormFields';
import {
  TEST_PLANS_PAGE_EVENTS,
  PLACE_DETAILS,
  ACTION_SOURCE,
  ADD_TO_LAUNCH_STATUS,
} from 'analyticsEvents/testPlansPageEvents';

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
  const { trackEvent } = useTracking();
  const activeTestPlan = useActiveTestPlan();

  const testPlanName = activeTestPlan?.name;
  const testPlanId = activeTestPlan?.id;

  const descriptionText = useMemo(() => {
    return formatMessage(launchFormMessages.addTestCasesFromTestPlan, {
      testPlanName: testPlanName || '',
      bold: BoldTestPlanName,
    });
  }, [testPlanName, formatMessage]);

  const handleSubmitSuccess = useCallback(
    (mode: LaunchMode) => {
      const source =
        testCases.length >= BULK_ADD_TO_LAUNCH_MIN_SELECTION
          ? ACTION_SOURCE.BULK
          : ACTION_SOURCE.SINGLE;

      trackEvent(
        TEST_PLANS_PAGE_EVENTS.submitAddToTestLaunch({
          source,
          place: PLACE_DETAILS,
          status:
            mode === LaunchMode.NEW
              ? ADD_TO_LAUNCH_STATUS.CREATE_NEW_LAUNCH
              : ADD_TO_LAUNCH_STATUS.ADD_TO_EXISTING_LAUNCH,
        }),
      );
    },
    [testCases.length, trackEvent],
  );

  return (
    <BaseLaunchModal
      {...reduxFormProps}
      testCases={testCases}
      testPlanId={testPlanId}
      modalTitle={formatMessage(messages.addToLaunch)}
      okButtonText={COMMON_LOCALE_KEYS.ADD}
      description={descriptionText}
      hideTestPlanField
      className={cx('create-launch-modal')}
      onSubmitSuccess={handleSubmitSuccess}
    />
  );
};

export const CreateLaunchModal = reduxForm<LaunchFormData, CreateLaunchModalProps>({
  form: 'create-launch-modal-form',
  destroyOnUnmount: true,
  initialValues: INITIAL_LAUNCH_FORM_VALUES,
})(CreateLaunchModalComponent);
