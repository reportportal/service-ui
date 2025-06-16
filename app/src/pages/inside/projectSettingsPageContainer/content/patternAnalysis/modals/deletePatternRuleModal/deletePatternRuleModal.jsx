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
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { withModal } from 'components/main/modal';
import { Modal } from '@reportportal/ui-kit';
import { hideModalAction } from 'controllers/modal';
import { messages } from './messages';

function DeletePatternRuleModal({ data }) {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  const okButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.DELETE),
    onClick: data.onDelete,
    variant: 'danger',
    'data-automation-id': 'submitButton',
  };
  const cancelButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    'data-automation-id': 'cancelButton',
  };

  return (
    <Modal
      title={formatMessage(messages.deletePattern)}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={() => dispatch(hideModalAction())}
    >
      {formatMessage(messages.deletePatternMsg)}
    </Modal>
  );
}
DeletePatternRuleModal.propTypes = {
  data: PropTypes.shape({
    onDelete: PropTypes.func,
  }),
};
DeletePatternRuleModal.defaultProps = {
  data: {
    onDelete: () => {},
  },
};

export default withModal('deletePatternRuleModal')(DeletePatternRuleModal);
