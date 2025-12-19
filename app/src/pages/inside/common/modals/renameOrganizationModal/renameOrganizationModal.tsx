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

import { useEffect } from 'react';
import { useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { InjectedFormProps, reduxForm } from 'redux-form';
import { useTracking } from 'react-tracking';
import { Modal, FieldText } from '@reportportal/ui-kit';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldProvider } from 'components/fields/fieldProvider';
import { commonValidators } from 'common/utils/validation';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { BoundValidator } from 'common/utils/validation/types';
import { hideModalAction } from 'controllers/modal';
import { ModalButtonProps } from 'types/common';
import { Organization } from 'controllers/organization';
import { renameOrganizationAction } from 'controllers/organization/actionCreators';
import { ORGANIZATION_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/organizationsPageEvents';
import {
  AssignedOrganizations,
  assignedOrganizationsSelector,
  fetchUserInfoAction,
} from 'controllers/user';
import { messages } from './messages';

const ORGANIZATION_NAME_FIELD = 'newOrganizationName';
const RENAME_ORGANIZATION_FORM = 'renameOrganizationForm';

interface RenameOrganizationFormProps {
  [ORGANIZATION_NAME_FIELD]: string;
}

interface ModalProps {
  organization: Organization;
  onRename?: () => void;
  place?: string;
}

type RenameOrganizationModalProps = InjectedFormProps<RenameOrganizationFormProps, ModalProps> &
  ModalProps;

const RenameOrganizationModal = ({
  organization,
  onRename,
  place = 'all_organizations',
  initialize,
  handleSubmit,
  anyTouched,
  invalid,
  dirty,
}: RenameOrganizationModalProps) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const assignedOrganizations = useSelector(assignedOrganizationsSelector) as AssignedOrganizations;
  const isAssignedToOrganization = organization.slug in assignedOrganizations;

  useEffect(() => {
    initialize({ [ORGANIZATION_NAME_FIELD]: organization.name });
  }, [initialize, organization.name]);

  const onSuccess = () => {
    dispatch(hideModalAction());
    onRename?.();
    if (isAssignedToOrganization) {
      dispatch(fetchUserInfoAction());
    }
  };

  const onSubmit = (formData: RenameOrganizationFormProps) => {
    const newOrganizationName = formData[ORGANIZATION_NAME_FIELD]?.trim();

    dispatch(renameOrganizationAction(organization.id, newOrganizationName, onSuccess));
    trackEvent(ORGANIZATION_PAGE_EVENTS.renameOrganization(place));
  };

  const okButton: ModalButtonProps = {
    children: formatMessage(COMMON_LOCALE_KEYS.RENAME),
    onClick: handleSubmit(onSubmit) as () => void,
    disabled: anyTouched && invalid,
    'data-automation-id': 'submitButton',
  };

  const cancelButton: ModalButtonProps = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    'data-automation-id': 'cancelButton',
  };

  return (
    <Modal
      title={formatMessage(messages.renameOrganization)}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={() => dispatch(hideModalAction())}
      allowCloseOutside={!dirty}
    >
      <FieldProvider name={ORGANIZATION_NAME_FIELD}>
        <FieldErrorHint provideHint={false}>
          <FieldText label={formatMessage(messages.organizationNameLabel)} defaultWidth={false} />
        </FieldErrorHint>
      </FieldProvider>
    </Modal>
  );
};

export default reduxForm<RenameOrganizationFormProps, ModalProps>({
  form: RENAME_ORGANIZATION_FORM,
  validate: (values) => {
    const newOrganizationName = values[ORGANIZATION_NAME_FIELD]?.trim();
    const organizationNameValidator: BoundValidator =
      commonValidators.createOrganizationNameValidator();

    return {
      [ORGANIZATION_NAME_FIELD]: organizationNameValidator(newOrganizationName),
    };
  },
})(RenameOrganizationModal);
