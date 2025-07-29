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

import { FC } from 'react';
import { useIntl } from 'react-intl';
import { InjectedFormProps, reduxForm } from 'redux-form';
import { FieldErrorHint } from 'components/fields/fieldErrorHint';
import { FieldProvider } from 'components/fields/fieldProvider';
import { commonValidators } from 'common/utils/validation';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { BoundValidator } from 'common/utils/validation/types';
import { Modal, FieldText } from '@reportportal/ui-kit';
import { hideModalAction } from 'controllers/modal';
import { ModalButtonProps } from 'types/common';
import { useDispatch } from 'react-redux';
import { useTracking } from 'react-tracking';
import classNames from 'classnames/bind';
import { ORGANIZATION_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/organizationsPageEvents';
import { messages } from '../../../messages';
import styles from './deleteOrganizationModal.scss';

const cx = classNames.bind(styles) as typeof classNames;

const ORGANIZATION_NAME_FIELD = 'organizationName';
const DELETE_ORGANIZATION_FORM = 'deleteOrganizationForm';

interface DeleteOrganizationFormProps {
  [ORGANIZATION_NAME_FIELD]: string;
}

interface ModalProps {
  data: {
    onConfirm: () => void;
    organizationName: string;
  };
}

type DeleteOrganizationModalProps = InjectedFormProps<DeleteOrganizationFormProps, ModalProps> &
  ModalProps;

const DeleteOrganizationModal: FC<DeleteOrganizationModalProps> = ({
  data: { onConfirm, organizationName },
  handleSubmit,
  anyTouched,
  invalid,
}) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();

  const hideModal = () => {
    trackEvent(ORGANIZATION_PAGE_EVENTS.meatballMenu('delete_organization_modal_cancel'));
    dispatch(hideModalAction());
  };

  const onSubmit = () => {
    trackEvent(ORGANIZATION_PAGE_EVENTS.meatballMenu('delete_organization_modal_delete'));
    onConfirm();
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
      title={formatMessage(messages.deleteOrganizationModalTitle)}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={hideModal}
    >
      <p className={cx('message')}>
        {formatMessage(messages.deleteOrganizationConfirmMessage, { organizationName })}
      </p>
      <FieldProvider name={ORGANIZATION_NAME_FIELD}>
        <FieldErrorHint provideHint={false}>
          <FieldText
            label={formatMessage(messages.confirmOrganizationNameEntry)}
            defaultWidth={false}
            placeholder={formatMessage(messages.organizationNamePlaceholder)}
          />
        </FieldErrorHint>
      </FieldProvider>
    </Modal>
  );
};

export default reduxForm<DeleteOrganizationFormProps, ModalProps>({
  form: DELETE_ORGANIZATION_FORM,
  validate: ({ organizationName: inputOrganizationValue }, { data: { organizationName } }) => {
    const organizationNameValidator: BoundValidator =
      commonValidators.createKeywordMatcherValidator(organizationName);

    return {
      organizationName: organizationNameValidator(inputOrganizationValue),
    };
  },
})(DeleteOrganizationModal);
