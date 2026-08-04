/*
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

import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages } from 'react-intl';

const messages = defineMessages({
  deleteModalConfirmationText: {
    id: 'DashboardPage.modal.deleteModalConfirmationText',
    defaultMessage:
      "Are you sure you want to delete dashboard ''<b>{name}</b>''? It will no longer exist.",
  },
});

export const DeleteDashboardConfirmationMessage = ({ name }) => (
  <FormattedMessage
    {...messages.deleteModalConfirmationText}
    values={{
      name,
      b: (chunks) => <b>{chunks}</b>,
    }}
  />
);

DeleteDashboardConfirmationMessage.propTypes = {
  name: PropTypes.string.isRequired,
};
