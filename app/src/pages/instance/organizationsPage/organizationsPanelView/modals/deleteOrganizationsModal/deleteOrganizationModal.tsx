/*!
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

import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { useTracking } from 'react-tracking';
import { Modal, FieldText } from '@reportportal/ui-kit';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { hideModalAction } from 'controllers/modal';
import { ORGANIZATION_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/organizationsPageEvents';
import { Organization } from 'controllers/organization';
import { InjectedFormProps, reduxForm } from 'redux-form';
import { FieldProvider } from 'components/fields/fieldProvider';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { BoundValidator } from 'common/utils/validation/types';
import { commonValidators } from 'common/utils/validation';
import { ModalButtonProps } from 'types/common';
import { messages } from 'pages/instance/organizationsPage/messages';
import classNames from 'classnames/bind';
import styles from './deleteOrganizationModal.scss';
import { deleteOrganizationAction } from 'controllers/instance/organizations/actionCreators';

const cx = classNames.bind(styles) as typeof classNames;

const ORGANIZATION_NAME_FIELD = 'organizationName';
const DELETE_ORGANIZATION_FORM = 'deleteOrganizationForm';

interface DeleteOrganizationFormProps {
  [ORGANIZATION_NAME_FIELD]: string;
}

interface ModalProps {
  organization: Organization;
  onDelete?: () => void;
}

type DeleteOrganizationModalProps = InjectedFormProps<DeleteOrganizationFormProps, ModalProps> &
  ModalProps;

const DeleteOrganizationModal = ({
  organization,
  onDelete,
  handleSubmit,
  anyTouched,
  invalid,
  dirty,
}: DeleteOrganizationModalProps) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();

  const onSubmit = () => {
    dispatch(deleteOrganizationAction(organization.id, onDelete));
    dispatch(hideModalAction());
    trackEvent(ORGANIZATION_PAGE_EVENTS.DELETE_ORGANIZATION);
  };

  const okButton: ModalButtonProps = {
    children: formatMessage(COMMON_LOCALE_KEYS.DELETE),
    onClick: handleSubmit(onSubmit) as () => void,
    variant: 'danger',
    disabled: anyTouched && invalid,
  };

  const cancelButton: ModalButtonProps = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
  };

  return (
    <Modal
      title={formatMessage(messages.deleteOrganization)}
      okButton={okButton}
      cancelButton={cancelButton}
      allowCloseOutside={!dirty}
    >
      <div className={cx('modal-content')}>
        <p>
          {formatMessage(messages.confirmDeleteOrganizationMessage, {
            name: organization.name,
            b: (data) => <b>{data}</b>,
          })}
        </p>
        <FieldProvider name={ORGANIZATION_NAME_FIELD}>
          <FieldErrorHint provideHint={false}>
            <FieldText
              label={formatMessage(messages.confirmOrganizationNameEntry)}
              defaultWidth={false}
              placeholder={formatMessage(messages.organizationName)}
            />
          </FieldErrorHint>
        </FieldProvider>
      </div>
    </Modal>
  );
};

export default reduxForm<DeleteOrganizationFormProps, ModalProps>({
  form: DELETE_ORGANIZATION_FORM,
  validate: ({ organizationName: inputOrganizationValue }, { organization }) => {
    const organizationNameValidator: BoundValidator =
      commonValidators.createKeywordMatcherValidator(organization.name);

    return {
      organizationName: organizationNameValidator(inputOrganizationValue),
    };
  },
})(DeleteOrganizationModal);
