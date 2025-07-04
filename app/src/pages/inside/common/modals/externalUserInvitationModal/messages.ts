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

import { defineMessages } from 'react-intl';

export const messages = defineMessages({
  header: {
    id: 'ExternalUserInvitationModal.header',
    defaultMessage: 'Invite User',
  },
  link: {
    id: 'ExternalUserInvitationModal.link',
    defaultMessage: 'Invitation link',
  },
  invitationMessage: {
    id: 'ExternalUserInvitationModal.invitationMessage',
    defaultMessage: 'Invitation email has been sent successfully to <b>{email}</b>',
  },
  copyLink: {
    id: 'ExternalUserInvitationModal.copyLink',
    defaultMessage: 'Copy link',
  },
  copyLinkSucces: {
    id: 'ExternalUserInvitationModal.copyLinkSuccess',
    defaultMessage: 'Invitation link has been copied successfully',
  },
  warningMessage: {
    id: 'ExternalUserInvitationModal.warningMessage',
    defaultMessage: 'Please be aware, the invitation expires after 24 hours',
  },
  gotIt: {
    id: 'ExternalUserInvitationModal.gotIt',
    defaultMessage: 'Got it',
  },
  emailServerIssueHeader: {
    id: 'ExternalUserInvitationModal.emailServerIssueHeader',
    defaultMessage: 'Email Server integration issue',
  },
  emailServerIssueText: {
    id: 'ExternalUserInvitationModal.emailServerIssueText',
    defaultMessage:
      'Email Server connection lost or not configured. The invite won’t be sent by email to the new user, but you’re able to copy and share the invitation link with the recipient directly.',
  },
});
