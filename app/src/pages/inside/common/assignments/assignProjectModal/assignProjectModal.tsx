/*!
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

import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { useTracking } from 'react-tracking';
import { Modal } from '@reportportal/ui-kit';
import { hideModalAction } from 'controllers/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ModalButtonProps } from 'types/common';
import { selfAssignToProjectAction } from 'controllers/organization/projects';
import { messages } from 'common/constants/localization/assignmentsLocalization';
import { ORGANIZATION_PAGE_EVENTS } from 'components/main/analytics/events/ga4Events/organizationsPageEvents';

interface Project {
  projectId: number;
  projectName: string;
}

interface AssignProjectModalProps {
  project: Project;
  onSuccess?: () => void;
}

export const AssignProjectModal = ({ project, onSuccess }: AssignProjectModalProps) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();

  const handleConfirm = () => {
    trackEvent(ORGANIZATION_PAGE_EVENTS.assignToProjectModal('assign'));
    dispatch(selfAssignToProjectAction(project.projectId, onSuccess));
  };

  const okButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.ASSIGN),
    onClick: handleConfirm,
    'data-automation-id': 'submitButton',
  } satisfies ModalButtonProps;

  const cancelButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    'data-automation-id': 'cancelButton',
  } satisfies ModalButtonProps;

  return (
    <Modal
      title={formatMessage(messages.assignProjectSelf)}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={() => dispatch(hideModalAction())}
    >
      <div>
        {formatMessage(messages.assignProjectSelfDescription, {
          projectName: project.projectName,
        })}
      </div>
    </Modal>
  );
};
