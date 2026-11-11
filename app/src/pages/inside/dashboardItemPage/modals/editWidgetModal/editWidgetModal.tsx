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

import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { destroy, getFormValues, isDirty } from 'redux-form';
import { useIntl, defineMessages } from 'react-intl';
import { Button, Modal } from '@reportportal/ui-kit';
import { createClassnames } from 'common/utils';
import { hideModalAction } from 'controllers/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { WIDGET_WIZARD_FORM } from '../common/constants';
import { DisabledButtons } from '../widgetWizardModal/types';
import { EditWidgetContent, EditWidgetContentHandle, EditableWidget } from './editWidgetContent';
import styles from './editWidgetModal.scss';

const cx = createClassnames(styles);

const messages = defineMessages({
  headerText: {
    id: 'EditWidgetModal.headerText',
    defaultMessage: 'Edit widget',
  },
});

interface EditWidgetModalData {
  widget?: EditableWidget;
  onConfirm?: (isForceUpdateNeeded: boolean) => void;
}

interface EditWidgetModalProps {
  data?: EditWidgetModalData;
}

export const EditWidgetModal = ({ data = {} }: EditWidgetModalProps) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const formValues = useSelector(getFormValues(WIDGET_WIZARD_FORM));
  const dirty = useSelector(isDirty(WIDGET_WIZARD_FORM));

  const [disabledButtons, setDisabledButtons] = useState<DisabledButtons>(null);
  const contentRef = useRef<EditWidgetContentHandle>(null);
  const { widget, onConfirm = () => {} } = data;

  const onClosed = () => {
    dispatch(hideModalAction());
    dispatch(destroy(WIDGET_WIZARD_FORM));
  };

  const createFooter = (closeModal: () => void) => (
    <div className={cx('footer')}>
      <Button variant="ghost" onClick={closeModal}>
        {formatMessage(COMMON_LOCALE_KEYS.CANCEL)}
      </Button>
      <Button
        onClick={() => contentRef.current?.submit()}
        disabled={disabledButtons === 'all' || disabledButtons === 'add'}
      >
        {formatMessage(COMMON_LOCALE_KEYS.SAVE)}
      </Button>
    </div>
  );

  return (
    <Modal
      title={formatMessage(messages.headerText)}
      onClose={onClosed}
      className={cx('edit-widget-modal', { 'without-footer': disabledButtons === 'all' })}
      allowCloseOutside={!dirty}
      withoutFooter={disabledButtons === 'all'}
      createFooter={createFooter}
    >
      {widget && (
        <EditWidgetContent
          ref={contentRef}
          sourceWidget={widget}
          formValues={formValues}
          closeModal={onClosed}
          onConfirm={onConfirm}
          onButtonsDisabledChange={setDisabledButtons}
        />
      )}
    </Modal>
  );
};
