/*
 * Copyright 2019 EPAM Systems
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

import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { URLS } from 'common/urls';
import { fetch } from 'common/utils';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import {
  showNotification,
  NOTIFICATION_TYPES,
  showDefaultErrorNotification,
} from 'controllers/notification';
import { withModal } from 'components/main/modal';
import { hideModalAction } from 'controllers/modal';
import { projectKeySelector } from 'controllers/project';
import { Modal } from '@reportportal/ui-kit';

const messages = defineMessages({
  removeIndexHeader: {
    id: 'RemoveIndexModal.headerRemoveIndexModal',
    defaultMessage: 'Remove index',
  },
  contentHeaderMessage: {
    id: 'RemoveIndexModal.contentHeaderMessage',
    defaultMessage: 'Are you sure to remove all data from the search engine?',
  },
  removeButtonText: {
    id: 'RemoveIndexModal.removeButtonText',
    defaultMessage: 'Remove',
  },
  removeSuccessNotification: {
    id: 'RemoveIndexModal.removeSuccessNotification',
    defaultMessage: 'Index was removed successfully',
  },
});

function RemoveIndexModal() {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const projectKey = useSelector(projectKeySelector);

  const onClickRemove = () => {
    fetch(URLS.projectIndex(projectKey), { method: 'delete' })
      .then(() => {
        dispatch(
          showNotification({
            message: formatMessage(messages.removeSuccessNotification),
            type: NOTIFICATION_TYPES.SUCCESS,
          }),
        );
      })
      .catch((error) => dispatch(showDefaultErrorNotification(error)));
    dispatch(hideModalAction());
  };

  const okButton = {
    children: formatMessage(messages.removeButtonText),
    variant: 'danger',
    onClick: onClickRemove,
  };
  const cancelButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
  };

  return (
    <Modal
      title={formatMessage(messages.removeIndexHeader)}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={() => dispatch(hideModalAction())}
    >
      {formatMessage(messages.contentHeaderMessage)}
    </Modal>
  );
}

export default withModal('removeIndexModalWindow')(RemoveIndexModal);
