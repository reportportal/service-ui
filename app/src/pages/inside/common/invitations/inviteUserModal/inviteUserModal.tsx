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

import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { reduxForm } from 'redux-form';
import DOMPurify from 'dompurify';
import { Modal } from '@reportportal/ui-kit';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils/fetch';
import { commonValidators } from 'common/utils/validation';
import { showSuccessNotification } from 'controllers/notification';
import { hideModalAction, showModalAction } from 'controllers/modal';
import { ModalButtonProps } from 'types/common';
import { ApiError } from 'types/api';
import { BoundValidator } from 'common/utils/validation/types';
import { InviteUserProjectForm } from './inviteUserProjectForm';
import { InviteUserOrganizationForm } from './inviteUserOrganizationForm/inviteUserOrganizationForm';
import { MEMBER } from 'common/constants/projectRoles';
import {
  activeOrganizationIdSelector,
  activeOrganizationNameSelector,
} from 'controllers/organization';
import { messages } from 'common/constants/localization/invitationsLocalization';
import { InvitationStatus, Level } from './constants';
import { ExternalUserInvitationModal } from '../../modals/externalUserInvitationModal';
import { useInviteUser } from './hooks';
import {
  FormDataMap,
  InvitationResponseData,
  InviteUserProps,
  ModalProps,
  InvitationRequestData,
} from './types';
import { Organization } from '../../assignments/organizationAssignment';
import { getFormName } from './utils';

export const InviteUser = <L extends keyof FormDataMap>({
  level,
  onInvite,
  content,
  handleSubmit,
  dirty,
  invalid,
  anyTouched,
}: InviteUserProps<L>) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const { header, okButtonTitle, buildUserData, handleError } = useInviteUser(level);

  const inviteUser = async (userData: InvitationRequestData, withProject: boolean) => {
    try {
      const invitedUser = (await fetch(URLS.userInvitations(), {
        method: 'post',
        data: userData,
      })) as InvitationResponseData;

      onInvite?.(withProject);

      return invitedUser;
    } catch (err) {
      handleError(err as ApiError, userData);

      return null;
    }
  };

  const inviteUserAndCloseModal = async (formData: FormDataMap[L]) => {
    const userData = buildUserData(formData);
    const withProject =
      level === Level.PROJECT
        ? false
        : userData.organizations.some(
            (org: Organization) => org.projects && org.projects.length > 0,
          );
    const invitedUser = await inviteUser(userData, withProject);

    if (!invitedUser) {
      return;
    }

    if (invitedUser?.status === InvitationStatus.PENDING) {
      dispatch(
        showModalAction({
          component: (
            <ExternalUserInvitationModal
              email={invitedUser.email}
              link={invitedUser.link}
              header={header}
            />
          ),
        }),
      );
    } else {
      const message = formatMessage(messages.memberWasInvited, {
        b: (innerData) => DOMPurify.sanitize(`<b>${innerData.join('')}</b>`),
        name: invitedUser.full_name,
      });
      dispatch(showSuccessNotification({ message }));
      dispatch(hideModalAction());
    }
  };

  const okButton: ModalButtonProps = {
    children: okButtonTitle,
    onClick: handleSubmit(inviteUserAndCloseModal) as () => void,
    disabled: anyTouched && invalid,
    'data-automation-id': 'submitButton',
  };

  const cancelButton: ModalButtonProps = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    'data-automation-id': 'cancelButton',
  };

  return (
    <Modal
      title={header}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={() => dispatch(hideModalAction())}
      size="large"
      allowCloseOutside={!dirty}
    >
      {content}
    </Modal>
  );
};

export const InviteUserModal = <L extends keyof FormDataMap>(props: ModalProps<L>) => {
  const id = useSelector(activeOrganizationIdSelector) as number;
  const name = useSelector(activeOrganizationNameSelector) as string;
  const level = props.level;
  const forms = {
    project: <InviteUserProjectForm />,
    organization: <InviteUserOrganizationForm />,
  };

  let initialValues = {};

  if (level === Level.ORGANIZATION) {
    const organization: Organization = { id, name, role: MEMBER, projects: [] };
    initialValues = { organization };
  }

  const Form = reduxForm<FormDataMap[L]>({
    form: getFormName(level),
    validate: (formData) => {
      const { email } = formData;
      const emailValidator: BoundValidator = commonValidators.emailInviteUserValidator();
      return { email: emailValidator(email?.trim()) };
    },
    enableReinitialize: true,
  })((formProps) => <InviteUser {...formProps} {...props} content={forms[level]} />);

  return <Form initialValues={initialValues} />;
};
