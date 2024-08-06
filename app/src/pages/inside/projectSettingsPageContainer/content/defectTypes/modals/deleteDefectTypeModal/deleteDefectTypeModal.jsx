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
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { Modal } from '@reportportal/ui-kit';
import { withModal } from 'components/main/modal';
import { hideModalAction } from 'controllers/modal';
import { useDispatch } from 'react-redux';

const messages = defineMessages({
  title: {
    id: 'DeleteDefectTypeModal.title',
    defaultMessage: 'Delete {name}',
  },
  message: {
    id: 'DeleteDefectTypeModal.message',
    defaultMessage: 'Are you sure you want to delete {name}?',
  },
});

const DeleteDefectTypeModal = ({
  data: {
    onSave,
    defectType: { name },
  },
}) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();

  return (
    <Modal
      title={formatMessage(messages.title, { name })}
      okButton={{
        children: formatMessage(COMMON_LOCALE_KEYS.DELETE),
        danger: true,
        onClick: onSave,
      }}
      cancelButton={{
        children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
      }}
      onClose={() => dispatch(hideModalAction())}
    >
      <div>{formatMessage(messages.message, { name })}</div>
    </Modal>
  );
};
DeleteDefectTypeModal.propTypes = {
  data: PropTypes.object,
};
DeleteDefectTypeModal.defaultProps = {
  data: {},
};

export const DeleteDefectTypeModalComponent = withModal('deleteDefectModal')(DeleteDefectTypeModal);
