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

import { reduxForm, InjectedFormProps } from 'redux-form';
import { useDispatch } from 'react-redux';
import { useTracking } from 'react-tracking';
import { useIntl } from 'react-intl';
import { Modal, FieldText } from '@reportportal/ui-kit';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldProvider } from 'components/fields/fieldProvider';
import { commonValidators } from 'common/utils/validation';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ORGANIZATION_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/organizationsPageEvents';
import { hideModalAction } from 'controllers/modal';
import { BoundValidator } from 'common/utils/validation/types';
import { messages } from '../../messages';

const ORGANIZATION_NAME_FIELD = 'organizationName';

interface CreateOrganizationFormData {
  organizationName: string;
}

interface CreateOrganizationModalProps {
  onSubmit: (organizationName: string) => void;
}

const CreateOrganizationModal = ({
  onSubmit,
  handleSubmit,
  anyTouched,
  invalid,
}: InjectedFormProps<CreateOrganizationFormData, CreateOrganizationModalProps> &
  CreateOrganizationModalProps) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();

  const onCreateOrganization = ({ organizationName }: CreateOrganizationFormData) => {
    onSubmit(organizationName);
    trackEvent(ORGANIZATION_PAGE_EVENTS.CLICK_CREATE_BUTTON);
  };
  const hideModal = () => dispatch(hideModalAction());

  return (
    <Modal
      title={formatMessage(messages.createOrganizationModalTitle)}
      okButton={{
        children: formatMessage(COMMON_LOCALE_KEYS.CREATE),
        onClick: handleSubmit(onCreateOrganization) as unknown as () => void,
        disabled: anyTouched && invalid,
      }}
      cancelButton={{
        children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      }}
      onClose={hideModal}
    >
      <FieldProvider name={ORGANIZATION_NAME_FIELD}>
        <FieldErrorHint provideHint={false}>
          <FieldText
            label={formatMessage(messages.createOrganizationLabel)}
            defaultWidth={false}
            placeholder={formatMessage(messages.createOrganizationPlaceholder)}
            maxLength={Infinity}
          />
        </FieldErrorHint>
      </FieldProvider>
    </Modal>
  );
};

export default reduxForm<CreateOrganizationFormData, CreateOrganizationModalProps>({
  form: 'createOrganizationForm',
  validate: ({ organizationName }) => {
    const trimmedOrganizationName = organizationName?.trim();
    const organizationNameValidator: BoundValidator = commonValidators.createProjectNameValidator();

    return {
      [ORGANIZATION_NAME_FIELD]: organizationNameValidator(trimmedOrganizationName),
    };
  },
})(CreateOrganizationModal);
