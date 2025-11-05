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

import { FormEvent, MouseEvent, useMemo } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { InjectedFormProps, reduxForm } from 'redux-form';
import { Modal, FieldText, FieldTextFlex } from '@reportportal/ui-kit';

import { createClassnames } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { hideModalAction } from 'controllers/modal';
import { commonValidators } from 'common/utils/validation';
import { FieldErrorHint, FieldProvider } from 'components/fields';
import { ModalLoadingOverlay } from 'components/modalLoadingOverlay';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';

import { TestPlanAttributes } from './testPlanAttributes';
import { messages } from './messages';

import styles from './testPlanModal.scss';

const cx = createClassnames(styles);

export interface Attribute {
  value: string;
  system?: boolean;
  key?: string;
  edited?: boolean;
  new?: boolean;
}

export interface TestPlanFormValues {
  name: string;
  description: string;
  attributes: Attribute[];
}

interface TestPlanModalProps {
  title: string;
  submitButtonText: string;
  isLoading: boolean;
  requiresChanges?: boolean;
  formName: string; // eslint-disable-line react/no-unused-prop-types
  initialValues?: Partial<TestPlanFormValues>; // eslint-disable-line react/no-unused-prop-types
  onSubmit: (values: TestPlanFormValues) => Promise<void>;
}

export const initialValues: Partial<TestPlanFormValues> = {
  name: '',
  description: '',
  attributes: [],
};

const TestPlanModalComponent = ({
  title,
  submitButtonText,
  isLoading,
  onSubmit,
  requiresChanges,
  dirty,
  invalid,
  handleSubmit,
}: TestPlanModalProps & InjectedFormProps<TestPlanFormValues>) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  const isSubmitDisabled = requiresChanges ? isLoading || !dirty || invalid : isLoading || invalid;

  const okButton = {
    children: <LoadingSubmitButton isLoading={isLoading}>{submitButtonText}</LoadingSubmitButton>,
    onClick: handleSubmit(onSubmit) as (event: MouseEvent<HTMLButtonElement>) => void,
    disabled: isSubmitDisabled,
  };

  const cancelButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    disabled: isLoading,
  };

  return (
    <Modal
      title={title}
      okButton={okButton}
      className={cx('test-plan-modal')}
      cancelButton={cancelButton}
      allowCloseOutside={!dirty}
      onClose={() => dispatch(hideModalAction())}
    >
      <div className={cx('test-plan-modal__content-wrapper')}>
        <form onSubmit={handleSubmit(onSubmit) as (event: FormEvent) => void}>
          <div className={cx('test-plan-modal__container')}>
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
        <ModalLoadingOverlay isVisible={isLoading} />
      </div>
    </Modal>
  );
};

export const TestPlanModal = (props: TestPlanModalProps) => {
  const FormWrapper = useMemo(
    () =>
      reduxForm<TestPlanFormValues, TestPlanModalProps>({
        form: props.formName,
        enableReinitialize: true,
        validate: ({ name }: { name: string }) => ({
          name: commonValidators.requiredField(name),
        }),
      })(TestPlanModalComponent),
    [props.formName],
  );

  return <FormWrapper {...props} initialValues={props.initialValues || initialValues} />;
};
