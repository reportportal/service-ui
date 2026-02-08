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

import { useMemo, ReactNode } from 'react';
import { useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { InjectedFormProps, reduxForm } from 'redux-form';

import { createClassnames } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { testCasesSelector } from 'controllers/testCase';
import {
  BaseLaunchModal,
  LaunchFormData,
  INITIAL_LAUNCH_FORM_VALUES,
} from 'pages/inside/common/launchFormFields';

import { AddToLaunchModalV2Props } from './types';
import { messages } from './messages';

import styles from './addToLaunchModalV2.scss';

const cx = createClassnames(styles);

const AddToLaunchModalV2Component = ({
  selectedRowsIds,
  ...reduxFormProps
}: AddToLaunchModalV2Props & InjectedFormProps<LaunchFormData>) => {
  const { formatMessage } = useIntl();
  const allTestCases = useSelector(testCasesSelector);

  const testCases = useMemo(() => {
    return allTestCases.filter((tc) => selectedRowsIds.includes(tc.id));
  }, [allTestCases, selectedRowsIds]);

  const descriptionText = useMemo(() => {
    return formatMessage(messages.addSelectedTestCases, {
      count: selectedRowsIds.length,
      bold: (value: ReactNode) => <b className={cx('selected-test-cases')}>{value}</b>,
    });
  }, [selectedRowsIds.length, formatMessage]);

  return (
    <BaseLaunchModal
      {...reduxFormProps}
      testCases={testCases}
      modalTitle={formatMessage(messages.addToLaunch)}
      okButtonText={COMMON_LOCALE_KEYS.ADD}
      description={descriptionText}
      isTestPlanFieldDisabled={false}
      className={cx('add-to-launch-modal-v2')}
    />
  );
};

export const AddToLaunchModalV2 = reduxForm<LaunchFormData, AddToLaunchModalV2Props>({
  form: 'add-to-launch-modal-v2-form',
  destroyOnUnmount: true,
  initialValues: INITIAL_LAUNCH_FORM_VALUES,
})(AddToLaunchModalV2Component);
