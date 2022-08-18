/*
 * Copyright 2022 EPAM Systems
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
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import Parser from 'html-react-parser';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ModalLayout } from 'componentLibrary/modal';
import { withModal } from 'components/main/modal';
import { hideModalAction } from 'controllers/modal';
import { useDispatch } from 'react-redux';

const messages = defineMessages({
  title: {
    id: 'DeleteNotificationCaseModal.title',
    defaultMessage: 'Delete Notification Rule',
  },
  message: {
    id: 'DeleteNotificationModal.message',
    defaultMessage: 'Are you sure you want to delete this notification rule?',
  },
});

const DeleteNotificationCaseModal = ({ data: { onSave }, dirty }) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  return (
    <ModalLayout
      title={formatMessage(messages.title)}
      okButton={{
        text: formatMessage(COMMON_LOCALE_KEYS.DELETE),
        danger: true,
        onClick: () => {
          onSave();
        },
      }}
      cancelButton={{
        text: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      }}
      onClose={() => dispatch(hideModalAction())}
      allowCloseOutside={!dirty}
    >
      <div>{Parser(formatMessage(messages.message))}</div>
    </ModalLayout>
  );
};
DeleteNotificationCaseModal.propTypes = {
  data: PropTypes.object,
  dirty: PropTypes.bool,
};
DeleteNotificationCaseModal.defaultProps = {
  data: {},
  dirty: false,
};

export default withModal('deleteNotificationModal')(DeleteNotificationCaseModal);
