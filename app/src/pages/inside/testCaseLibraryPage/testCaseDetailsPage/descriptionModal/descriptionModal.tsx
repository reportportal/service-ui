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

import { MouseEvent, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { defineMessages, useIntl } from 'react-intl';
import { reduxForm, InjectedFormProps } from 'redux-form';
import { FieldTextFlex, Modal } from '@reportportal/ui-kit';
import { isEmpty } from 'es-toolkit/compat';

import { TestCase } from 'pages/inside/testCaseLibraryPage/types';
import { commonMessages as globalCommonMessages } from 'pages/inside/common/common-messages';
import { hideModalAction, withModal } from 'controllers/modal';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';
import { ModalLoadingOverlay } from 'components/modalLoadingOverlay';
import { FieldErrorHint, FieldProvider } from 'components/fields';
import { createClassnames } from 'common/utils';
import { UseModalData } from 'common/hooks';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { Validator } from 'common/utils/validation/types';
import { bindMessageToValidator, validate, MAX_FIELD_LENGTH } from 'common/utils/validation';

import { useDescription } from './useDescription';
import { useDescriptionModalResize } from './useDescriptionModalResize';

import styles from './descriptionModal.scss';

const messages = defineMessages({
  addDescription: {
    id: 'DescriptionModal.addDescription',
    defaultMessage: 'Add Description',
  },
  editDescription: {
    id: 'DescriptionModal.editDescription',
    defaultMessage: 'Edit Description',
  },
  enterDescription: {
    id: 'DescriptionModal.enterDescription',
    defaultMessage: 'Enter description',
  },
});

const cx = createClassnames(styles);

export const DESCRIPTION_MODAL_KEY = 'descriptionModalKey';

export interface DescriptionModalData {
  testCaseDetails: TestCase;
}

interface DescriptionFormValues {
  description: string;
}

type DescriptionModalProps = UseModalData<DescriptionModalData>;

const DescriptionModalComponent = ({
  data: { testCaseDetails },
  dirty,
  invalid,
  anyTouched,
  pristine,
  initialize,
  handleSubmit,
}: DescriptionModalProps & InjectedFormProps<DescriptionFormValues, DescriptionModalProps>) => {
  const dispatch = useDispatch();
  const { isLoading, updateDescription } = useDescription(testCaseDetails.id);
  const { formatMessage } = useIntl();
  const testCaseDescription = testCaseDetails.description;
  const isDescriptionExist = !isEmpty(testCaseDescription);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  useDescriptionModalResize(textareaRef);

  useEffect(() => {
    if (isDescriptionExist) {
      initialize({ description: testCaseDescription });
    }
  }, [testCaseDescription, isDescriptionExist, initialize]);

  const hideModal = () => dispatch(hideModalAction());

  const onSubmit = async (values: DescriptionFormValues) => {
    await updateDescription(values.description.trim());
  };

  const okButton = {
    children: (
      <LoadingSubmitButton isLoading={isLoading}>
        {formatMessage(COMMON_LOCALE_KEYS.SAVE)}
      </LoadingSubmitButton>
    ),
    onClick: handleSubmit(onSubmit) as (event: MouseEvent<HTMLButtonElement>) => void,
    disabled: pristine || (invalid && anyTouched) || isLoading,
    'data-automation-id': 'submitButton',
  };

  const cancelButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    disabled: isLoading,
    'data-automation-id': 'cancelButton',
  };

  return (
    <Modal
      title={
        isDescriptionExist
          ? formatMessage(messages.editDescription)
          : formatMessage(messages.addDescription)
      }
      okButton={okButton}
      cancelButton={cancelButton}
      allowCloseOutside={!dirty}
      onClose={hideModal}
      scrollable
    >
      {/* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */}
      <form onSubmit={handleSubmit(onSubmit)} className={cx('description-modal__form')}>
        <FieldProvider name="description" placeholder={formatMessage(messages.enterDescription)}>
          <FieldErrorHint provideHint={false}>
            <FieldTextFlex
              ref={textareaRef}
              label={formatMessage(globalCommonMessages.description)}
              maxLength={MAX_FIELD_LENGTH as number}
              maxLengthDisplay={MAX_FIELD_LENGTH as number}
              minHeight={120}
              value=""
            />
          </FieldErrorHint>
        </FieldProvider>
        <ModalLoadingOverlay isVisible={isLoading} />
      </form>
    </Modal>
  );
};

export default withModal(DESCRIPTION_MODAL_KEY)(
  reduxForm<DescriptionFormValues, DescriptionModalProps>({
    form: 'description-modal-form',
    destroyOnUnmount: true,
    shouldValidate: () => true,
    validate: ({ description }) => ({
      description: bindMessageToValidator(
        validate.testCaseDescription as Validator,
        'testCaseDescriptionHint',
      )(description),
    }),
  })(DescriptionModalComponent),
);
