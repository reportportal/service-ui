/*
 * Copyright 2021 EPAM Systems
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
  requestSupport: {
    id: 'SupportBlock.requestSupport',
    defaultMessage: 'Request support',
  },
  helpAndSupport: {
    id: 'SupportBlock.helpAndSupport',
    defaultMessage: 'help & support',
  },
  tryFindSolution: {
    id: 'SupportBlock.tryFindSolution',
    defaultMessage: 'You can try to find a problem & solution below',
  },
  instruction: {
    id: 'SupportBlock.instruction',
    defaultMessage: 'Instruction',
  },
  askQuestion: {
    id: 'SupportBlock.askQuestion',
    defaultMessage: 'Ask a question',
  },
  note: {
    id: 'SupportBlock.note',
    defaultMessage:
      'If you have some special issue ask help {ourSupportTeam} or submit your question in our {slackChannel}',
  },
  ourSupportTeam: {
    id: 'SupportBlock.ourSupportTeam',
    defaultMessage: 'our Support team',
  },
  slackChannel: {
    id: 'SupportBlock.slackChannel',
    defaultMessage: 'Slack channel',
  },
  modalText: {
    id: 'SupportBlock.modalText',
    defaultMessage:
      'ReportPortal is free and open source under the Apache 2.0 license, with no charges or hidden fees.<br/>But if you’re looking for dedicated professional support for installation, integration, or customization, we offer support plans for businesses of all sizes. Want to learn more? Please send a request and we will be in touch!',
  },
  firstNamePlaceholder: {
    id: 'SupportBlock.firstNamePlaceholder',
    defaultMessage: 'First name',
  },
  lastNamePlaceholder: {
    id: 'SupportBlock.lastNamePlaceholder',
    defaultMessage: 'Last name',
  },
  emailPlaceholder: {
    id: 'SupportBlock.emailPlaceholder',
    defaultMessage: 'E-mail',
  },
  companyNamePlaceholder: {
    id: 'SupportBlock.companyNamePlaceholder',
    defaultMessage: 'Company name',
  },
  requestSent: {
    id: 'SupportBlock.requestSent',
    defaultMessage: 'Request has been sent',
  },
  requestSentFail: {
    id: 'SupportBlock.requestSentFail',
    defaultMessage: 'Request was not sent',
  },
});
