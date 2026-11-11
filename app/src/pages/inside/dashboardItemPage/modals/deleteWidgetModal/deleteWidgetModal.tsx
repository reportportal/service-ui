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

import { ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import { useIntl, defineMessages } from 'react-intl';
import { Modal } from '@reportportal/ui-kit';
import { hideModalAction } from 'controllers/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { createClassnames } from 'common/utils';
import { ModalButtonProps } from 'types/common';
import styles from './deleteWidgetModal.scss';

const cx = createClassnames(styles);

const messages = defineMessages({
  title: {
    id: 'DeleteWidgetModal.title',
    defaultMessage: 'Delete Widget',
  },
  description: {
    id: 'DeleteWidgetModal.description',
    defaultMessage:
      "Are you sure you want to delete widget <b>{name}</b>? It will no longer exist. This action can't be undone.",
  },
});

const Bold = (chunks: ReactNode) => <b>{chunks}</b>;

interface DeleteWidgetModalProps {
  data: {
    widget: {
      name: string;
    };
    onConfirm: () => void;
  };
}

export const DeleteWidgetModal = ({ data: { widget, onConfirm } }: DeleteWidgetModalProps) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  const handleConfirm = () => {
    onConfirm();
    dispatch(hideModalAction());
  };

  const okButton: ModalButtonProps = {
    children: formatMessage(COMMON_LOCALE_KEYS.DELETE),
    variant: 'danger',
    onClick: handleConfirm,
    'data-automation-id': 'submitButton',
  };

  const cancelButton: ModalButtonProps = {
    children: formatMessage(COMMON_LOCALE_KEYS.CANCEL),
    'data-automation-id': 'cancelButton',
  };

  return (
    <Modal
      title={formatMessage(messages.title)}
      okButton={okButton}
      cancelButton={cancelButton}
      onClose={() => dispatch(hideModalAction())}
    >
      <div className={cx('modal-content')}>
        {formatMessage(messages.description, {
          name: widget.name,
          b: Bold,
        })}
      </div>
    </Modal>
  );
};
