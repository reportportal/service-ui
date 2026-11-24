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
import { createClassnames } from 'common/utils';
import { hideModalAction } from 'controllers/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { ModalButtonProps } from 'types/common';

import styles from './updateWidgetDataModal.scss';

const cx = createClassnames(styles);

const messages = defineMessages({
  title: {
    id: 'Widget.forceUpdateWidgetTitle',
    defaultMessage: 'Update Widget Data',
  },
  description: {
    id: 'Widget.forceUpdateWidgetMessage',
    defaultMessage:
      'Are you sure you want to update data in this widget? It could take <b>up to 15 minutes</b> depending on the database size of the project.',
  },
});

const renderBoldText = (text: ReactNode) => (
  <b className={cx('update-widget-data-modal__text--bold')}>{text}</b>
);

interface UpdateWidgetDataModalProps {
  data: {
    onConfirm: () => void;
  };
}

export const UpdateWidgetDataModal = ({ data: { onConfirm } }: UpdateWidgetDataModalProps) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  const handleConfirm = () => {
    onConfirm();
    dispatch(hideModalAction());
  };

  const okButton: ModalButtonProps = {
    children: formatMessage(COMMON_LOCALE_KEYS.UPDATE),
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
      {formatMessage(messages.description, { b: renderBoldText })}
    </Modal>
  );
};
