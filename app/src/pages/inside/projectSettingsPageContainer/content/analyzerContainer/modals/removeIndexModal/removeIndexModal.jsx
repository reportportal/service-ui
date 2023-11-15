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
import { projectIdSelector } from 'controllers/pages';
import { withModal } from 'components/main/modal';
import { hideModalAction } from 'controllers/modal';
import { ModalLayout } from 'componentLibrary/modal';

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

const RemoveIndexModal = () => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const projectId = useSelector(projectIdSelector);

  const onClickRemove = () => {
    fetch(URLS.projectIndex(projectId), { method: 'delete' })
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
    text: formatMessage(messages.removeButtonText),
    danger: true,
    onClick: onClickRemove,
  };
  const cancelButton = {
    text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
  };

  return (
    <ModalLayout
      title={formatMessage(messages.removeIndexHeader)}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={() => dispatch(hideModalAction())}
    >
      {formatMessage(messages.contentHeaderMessage)}
    </ModalLayout>
  );
};

export default withModal('removeIndexModalWindow')(RemoveIndexModal);
