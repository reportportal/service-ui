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

import { FormEvent, MouseEvent } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import { InjectedFormProps, reduxForm, Field } from 'redux-form';
import { Modal, FieldText, FieldTextFlex } from '@reportportal/ui-kit';
import { noop } from 'es-toolkit';

import { createClassnames } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { hideModalAction } from 'controllers/modal';
import { commonValidators } from 'common/utils/validation';
import { FieldErrorHint, FieldProvider } from 'components/fields';
import { ModalLoadingOverlay } from 'components/modalLoadingOverlay';
import { LoadingSubmitButton } from 'components/loadingSubmitButton';
import { AttributeList } from 'componentLibrary/attributeList';
import { FieldElement } from 'pages/inside/projectSettingsPageContainer/content/elements';
import { commonMessages } from 'pages/inside/common/common-messages';

import { CreateLaunchFormValues, CreateLaunchModalProps, AttributeListFieldProps } from './types';
import { INITIAL_VALUES } from './constants';
import { messages } from './messages';

import styles from './createLaunchModal.scss';

const cx = createClassnames(styles);

const AttributeListField = ({ input, ...rest }: AttributeListFieldProps) => (
  <AttributeList
    {...input}
    {...rest}
    attributes={input.value || []}
    onChange={input.onChange}
    isAttributeValueRequired={false}
  />
);

const CreateLaunchModalComponent = ({
  isLoading,
  onSubmit,
  dirty,
  invalid,
  handleSubmit,
  selectedTestsCount,
}: CreateLaunchModalProps & InjectedFormProps<CreateLaunchFormValues>) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  const isSubmitDisabled = isLoading || invalid;
  const hasSelectedTests = !!selectedTestsCount;

  const okButton = {
    children: (
      <LoadingSubmitButton isLoading={isLoading}>
        {formatMessage(COMMON_LOCALE_KEYS.CREATE)}
      </LoadingSubmitButton>
    ),
    onClick: handleSubmit(onSubmit) as (event: MouseEvent<HTMLButtonElement>) => void,
    disabled: isSubmitDisabled,
  };

  const cancelButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    disabled: isLoading,
  };

  return (
    <Modal
      title={formatMessage(messages.createLaunch)}
      okButton={okButton}
      className={cx('create-launch-modal')}
      cancelButton={cancelButton}
      allowCloseOutside={!dirty}
      onClose={() => dispatch(hideModalAction())}
    >
      <div className={cx('create-launch-modal__content-wrapper')}>
        <form onSubmit={handleSubmit(onSubmit) as (event: FormEvent) => void}>
          <div className={cx('create-launch-modal__container')}>
            {hasSelectedTests && (
              <div className={cx('scope-of-testing-field')}>
                <FieldProvider
                  name="scopeOfTesting"
                  disabled
                  value={`Selected tests (${selectedTestsCount})`}
                >
                  <FieldErrorHint provideHint={false}>
                    <FieldText
                      label={formatMessage(messages.scopeOfTesting)}
                      defaultWidth={false}
                      disabled
                    />
                  </FieldErrorHint>
                </FieldProvider>
              </div>
            )}
            <div className={cx('launch-name-field')}>
              <FieldProvider name="name" placeholder={formatMessage(messages.enterLaunchName)}>
                <FieldErrorHint provideHint={false}>
                  <FieldText
                    label={formatMessage(messages.launchName)}
                    defaultWidth={false}
                    isRequired
                  />
                </FieldErrorHint>
              </FieldProvider>
            </div>
            <FieldProvider
              name="description"
              placeholder={formatMessage(messages.addLaunchDescriptionOptional)}
            >
              <FieldTextFlex label={formatMessage(commonMessages.description)} value="" />
            </FieldProvider>
            <div className={cx('attributes-section')}>
              <FieldElement
                label={formatMessage(messages.launchAttributes)}
                withoutProvider
                childrenClassName={cx('attributes-content')}
              >
                <Field
                  name="attributes"
                  component={AttributeListField}
                  showButton
                  newAttrMessage={formatMessage(messages.addAttributes)}
                  addButtonClassName={cx('add-attribute-button')}
                  maxLength={50}
                  editable
                  defaultOpen={false}
                  getURIKey={noop}
                  getURIValue={noop}
                  minLength={9999}
                  autocompleteProps={{
                    onStateChange: () => {},
                    options: [],
                    async: false,
                  }}
                />
              </FieldElement>
            </div>
          </div>
        </form>
        <ModalLoadingOverlay isVisible={isLoading} />
      </div>
    </Modal>
  );
};

const validate = ({ name, attributes }: CreateLaunchFormValues) => {
  const errors: Record<string, string> = {};

  if (commonValidators.requiredField(name)) {
    errors.name = commonValidators.requiredField(name);
  }

  // Validate attributes: if an attribute has a value, it must have a key
  if (attributes && attributes.length > 0) {
    const hasInvalidAttribute = attributes.some((attr) => attr.value && !attr.key);
    if (hasInvalidAttribute) {
      errors.attributes = 'Key cannot be empty';
    }
  }

  return errors;
};

export const CreateLaunchModal = reduxForm<CreateLaunchFormValues, CreateLaunchModalProps>({
  form: 'create-launch-modal-form',
  validate,
  initialValues: INITIAL_VALUES,
})(CreateLaunchModalComponent);
