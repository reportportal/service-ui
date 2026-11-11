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

import { useIntl, defineMessages } from 'react-intl';
import { BoldText } from 'components/boldText';
import { DeleteConfirmationModal } from 'components/deleteConfirmationModal';

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

interface DeleteWidgetModalProps {
  data: {
    widget: {
      name: string;
    };
    onConfirm: () => void;
  };
}

export const DeleteWidgetModal = ({ data: { widget, onConfirm } }: DeleteWidgetModalProps) => {
  const { formatMessage } = useIntl();

  return (
    <DeleteConfirmationModal
      title={formatMessage(messages.title)}
      description={formatMessage(messages.description, {
        name: widget.name,
        b: BoldText,
      })}
      onConfirm={onConfirm}
    />
  );
};
