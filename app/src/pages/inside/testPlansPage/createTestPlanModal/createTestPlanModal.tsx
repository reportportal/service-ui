/*
 * Copyright 2025 EPAM Systems
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
import { useDispatch } from 'react-redux';
import { InjectedFormProps, reduxForm } from 'redux-form';
import classNames from 'classnames/bind';
import { Modal, FieldText, FieldTextFlex } from '@reportportal/ui-kit';

import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { hideModalAction } from 'controllers/modal';
import { commonValidators } from 'common/utils/validation';
import { FieldErrorHint, FieldProvider } from 'components/fields';
import { ModalLoadingOverlay } from 'components/modalLoadingOverlay';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';

import { TestPlanAttributes } from './testPlanAttributes';
import { messages } from './messages';
import { commonMessages } from '../commonMessages';
import { useCreateTestPlan } from './useCreateTestPlan';

import styles from './createTestPlanModal.scss';
import { FormEvent, MouseEvent } from 'react';

const cx = classNames.bind(styles) as typeof classNames;

export const CREATE_TEST_PLAN_MODAL_KEY = 'createTestPlanModalKey';

interface Attribute {
  value: string;
  system?: boolean;
  key?: string;
  edited?: boolean;
  new?: boolean;
}

interface CreateTestPlanFormValues {
  name: string;
  description: string;
  attributes: Attribute[];
}

export const CreateTestPlanModal = reduxForm<CreateTestPlanFormValues>({
  form: 'create-test-plan-modal-form',
  initialValues: {
    name: '',
    description: '',
    attributes: [],
  },
  validate: ({ name }: { name: string }) => ({
    name: commonValidators.requiredField(name),
  }),
})(({ dirty, handleSubmit }: InjectedFormProps<CreateTestPlanFormValues>) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { isCreateTestPlanLoading, createTestPlan } = useCreateTestPlan();

  const okButton = {
    children: (
      <LoadingSubmitButton isLoading={isCreateTestPlanLoading}>
        {formatMessage(COMMON_LOCALE_KEYS.CREATE)}
      </LoadingSubmitButton>
    ),
    onClick: handleSubmit(createTestPlan) as (event: MouseEvent<HTMLButtonElement>) => void,
    disabled: isCreateTestPlanLoading,
  };

  const cancelButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    disabled: isCreateTestPlanLoading,
  };

  return (
    <Modal
      title={formatMessage(commonMessages.createTestPlan)}
      okButton={okButton}
      className={cx('create-test-plan-modal')}
      cancelButton={cancelButton}
      allowCloseOutside={!dirty}
      onClose={() => dispatch(hideModalAction())}
    >
      <div className={cx('create-test-plan-modal__content-wrapper')}>
        <form onSubmit={handleSubmit(createTestPlan) as (event: FormEvent) => void}>
          <div className={cx('create-test-plan-modal__container')}>
            <FieldProvider name="name" placeholder={formatMessage(messages.enterTestPlanName)}>
              <FieldErrorHint provideHint={false}>
                <FieldText
                  label={formatMessage(COMMON_LOCALE_KEYS.NAME)}
                  defaultWidth={false}
                  isRequired
                />
              </FieldErrorHint>
            </FieldProvider>
            <FieldProvider
              name="description"
              placeholder={formatMessage(messages.addTestPlanDescription)}
            >
              <FieldErrorHint provideHint={false}>
                <FieldTextFlex label={formatMessage(messages.description)} value="" />
              </FieldErrorHint>
            </FieldProvider>
            <TestPlanAttributes />
          </div>
        </form>
        <ModalLoadingOverlay isVisible={isCreateTestPlanLoading} />
      </div>
    </Modal>
  );
});
