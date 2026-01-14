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

import { useIntl } from 'react-intl';
import {
  Button,
  FieldText,
  Modal,
  StatusSuccessIcon,
  SystemMessage,
  WarningIcon,
} from '@reportportal/ui-kit';
import { useDispatch, useSelector } from 'react-redux';

import { createClassnames } from 'common/utils';
import { isEmailIntegrationAvailableSelector } from 'controllers/plugins';
import { showErrorNotification, showSuccessNotification } from 'controllers/notification';

import { messages } from './messages';

import styles from './externalUserInvitationModal.scss';

const cx = createClassnames(styles);

interface ExternalUserInvitationModalProps {
  email: string;
  link: string;
  header?: string;
}

export const ExternalUserInvitationModal = ({
  email,
  link,
  header,
}: ExternalUserInvitationModalProps) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const isEmailIntegrationAvailable = useSelector(isEmailIntegrationAvailableSelector);
  const modalTitle = header || formatMessage(messages.header);
  const invitationMessageText = formatMessage(messages.invitationMessage, {
    email,
    b: (innerData) => <b>{innerData}</b>,
  });

  const copyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(link)
        .then(() =>
          dispatch(showSuccessNotification({ message: formatMessage(messages.copyLinkSuccess) })),
        )
        .catch((err: Error) => dispatch(showErrorNotification({ message: err.message })));
    }
  };

  return (
    <Modal
      size="large"
      title={modalTitle}
      createFooter={(closeModal) => (
        <div className={cx('footer')}>
          <div className={cx('info')}>
            <WarningIcon />
            {formatMessage(messages.warningMessage)}
          </div>
          <div className={cx('buttons')}>
            <Button onClick={copyLink}>{formatMessage(messages.copyLink)}</Button>
            <Button variant="ghost" onClick={closeModal}>
              {formatMessage(messages.gotIt)}
            </Button>
          </div>
        </div>
      )}
    >
      <div className={cx('content')}>
        {isEmailIntegrationAvailable ? (
          <div className={cx('invitation-message')}>
            <StatusSuccessIcon />
            <div className={cx('text')}>{invitationMessageText}</div>
          </div>
        ) : (
          <SystemMessage mode="warning" header={formatMessage(messages.emailServerIssueHeader)}>
            {formatMessage(messages.emailServerIssueText)}
          </SystemMessage>
        )}
        <div className={cx('invitation-link')}>
          <FieldText
            value={link}
            label={formatMessage(messages.link)}
            defaultWidth={false}
            disabled
          />
        </div>
      </div>
    </Modal>
  );
};
