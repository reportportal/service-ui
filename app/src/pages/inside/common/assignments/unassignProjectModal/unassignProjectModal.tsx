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

import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { Modal } from '@reportportal/ui-kit';
import classNames from 'classnames/bind';
import { hideModalAction } from 'controllers/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ModalButtonProps } from 'types/common';
import { fetchUserAction, idSelector } from 'controllers/user';
import { messages } from 'common/constants/localization/assignmentsLocalization';
import styles from './unassignProjectModal.scss';
import { unassignFromProjectAction } from 'controllers/organization/projects';

const cx = classNames.bind(styles) as typeof classNames;

interface User {
  id: number;
  fullName: string;
}

interface Project {
  projectId: number;
  projectName: string;
}

interface UnassignProjectModalProps {
  user: User;
  project: Project;
  onSuccess?: () => void;
}

export const UnassignProjectModal = ({ user, project, onSuccess }: UnassignProjectModalProps) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const currentUserId = useSelector(idSelector) as number;
  const isCurrentUser = currentUserId === user.id;
  const headerMessage = isCurrentUser ? messages.unassignProjectSelf : messages.unassignProjectUser;
  const descriptionMessage = isCurrentUser
    ? messages.unassignProjectSelfDescription
    : messages.unassignProjectUserDescription;

  const handleUnassignSuccess = () => {
    if (currentUserId === user.id) {
      dispatch(fetchUserAction(true));
    }

    dispatch(hideModalAction());
    onSuccess?.();
  };

  const okButton: ModalButtonProps = {
    text: formatMessage(COMMON_LOCALE_KEYS.UNASSIGN),
    children: formatMessage(COMMON_LOCALE_KEYS.UNASSIGN),
    onClick: () => {
      dispatch(unassignFromProjectAction(user, project, handleUnassignSuccess));
    },
    'data-automation-id': 'submitButton',
  };

  const cancelButton: ModalButtonProps = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    'data-automation-id': 'cancelButton',
  };

  return (
    <Modal
      title={formatMessage(headerMessage)}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={() => dispatch(hideModalAction())}
    >
      <div className={cx('modal-content')}>
        {formatMessage(descriptionMessage, {
          name: user.fullName,
          project: project.projectName,
          b: (innerData) => <b>{innerData}</b>,
        })}
      </div>
    </Modal>
  );
};
