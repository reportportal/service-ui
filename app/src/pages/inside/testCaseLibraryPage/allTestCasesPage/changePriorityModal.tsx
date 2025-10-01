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

  const onSave = async () => {
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
    onClick: onSave,
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
