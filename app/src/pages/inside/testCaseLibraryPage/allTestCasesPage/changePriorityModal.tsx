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

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useIntl } from 'react-intl';
import { Modal } from '@reportportal/ui-kit';

import { hideModalAction, withModal } from 'controllers/modal';
import { urlFolderIdSelector } from 'controllers/pages';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { PrioritySelect } from '../prioritySelect/prioritySelect';
import { useUpdateTestCase } from '../testCaseDetailsPage/editTestCaseModal/useUpdateTestCase';
import { messages } from './messages';

export const CHANGE_PRIORITY_MODAL_KEY = 'changePriorityModalKey';

interface ChangePriorityModalProps {
  data: {
    priority: string;
    selectedRowIds: number[];
    onClearSelection: () => void;
  };
}

const ChangePriorityModal = ({ data }: ChangePriorityModalProps) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const [priority, setPriority] = useState(data.priority);
  const { bulkUpdateTestCases } = useUpdateTestCase();
  const folderId = useSelector(urlFolderIdSelector);

  const hideModal = () => dispatch(hideModalAction());

  const handleSave = async () => {
    await bulkUpdateTestCases(
      {
        testCaseIds: data.selectedRowIds,
        folderId,
        priority,
      },
      data.onClearSelection,
    );
  };

  const okButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.SAVE),
    onClick: handleSave,
  };

  const cancelButton = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    onClick: hideModal,
  };

  return (
    <Modal
      title={formatMessage(messages.changePriorityTitle)}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={hideModal}
    >
      <PrioritySelect value={priority} onChange={setPriority} />
    </Modal>
  );
};

export default withModal(CHANGE_PRIORITY_MODAL_KEY)(ChangePriorityModal);
