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
import { destroy, getFormValues } from 'redux-form';
import { useIntl, defineMessages } from 'react-intl';
import { ArrowLeftIcon, ArrowRightIcon, Button, Modal } from '@reportportal/ui-kit';
import { createClassnames } from 'common/utils';
import { hideModalAction } from 'controllers/modal';
import { COMMON_LOCALE_KEYS } from 'common/constants/localization';
import { WIDGET_WIZARD_FORM } from '../common/constants';
import { WidgetWizardContent, WidgetWizardContentHandle } from './widgetWizardContent';
import { DisabledButtons, Widget } from './types';
import styles from './widgetWizardModal.scss';

const cx = createClassnames(styles);

const messages = defineMessages({
  headerText: {
    id: 'WidgetWizardModal.headerText',
    defaultMessage: 'Add new widget',
  },
  prevStepButton: {
    id: 'WizardInfoSection.prevStepButton',
    defaultMessage: 'Previous step',
  },
  nextStepButton: {
    id: 'WizardInfoSection.nextStepButton',
    defaultMessage: 'Next step',
  },
});

interface WidgetWizardModalData {
  onConfirm?: (widget: Widget, closeModal: () => void) => void | Promise<void>;
  eventsInfo?: Record<string, unknown>;
}

interface WidgetWizardModalProps {
  data?: WidgetWizardModalData;
}

export const WidgetWizardModal = ({
  data = { onConfirm: () => {}, eventsInfo: {} },
}: WidgetWizardModalProps) => {
  const { formatMessage } = useIntl();
  const dispatch = useDispatch();
  const formValues = useSelector(getFormValues(WIDGET_WIZARD_FORM));

  const [step, setStep] = useState(0);
  const [disabledButtons, setDisabledButtons] = useState<DisabledButtons>(null);
  const contentRef = useRef<WidgetWizardContentHandle>(null);

  const onClosed = () => {
    dispatch(hideModalAction());
    dispatch(destroy(WIDGET_WIZARD_FORM));
  };

  const createFooter = (closeModal: () => void) => (
    <div className={cx('wizard-footer')}>
      <Button
        variant="ghost"
        onClick={closeModal}
      >
        {formatMessage(COMMON_LOCALE_KEYS.CANCEL)}
      </Button>
      <div className={cx('action-buttons')}>
        {step !== 0 && (
          <Button
            variant="ghost"
            icon={<ArrowLeftIcon />}
            onClick={() => contentRef.current?.onClickPrevStep()}
            disabled={disabledButtons === 'all' || disabledButtons === 'prev'}
          >
            {formatMessage(messages.prevStepButton)}
          </Button>
        )}
        {step !== 1 ? (
          <Button
            icon={<ArrowRightIcon />}
            iconPlace="end"
            onClick={() => contentRef.current?.onClickNextStep()}
            disabled={disabledButtons === 'all' || disabledButtons === 'add'}
          >
            {formatMessage(messages.nextStepButton)}
          </Button>
        ) : (
          <Button
            onClick={() => contentRef.current?.onClickNextStep()}
            disabled={disabledButtons === 'all' || disabledButtons === 'add'}
          >
            {formatMessage(COMMON_LOCALE_KEYS.ADD)}
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      title={formatMessage(messages.headerText)}
      onClose={onClosed}
      className={cx('widget-wizard-modal')}
      createFooter={createFooter}
    >
      <WidgetWizardContent
        ref={contentRef}
        closeModal={onClosed}
        onConfirm={data.onConfirm}
        eventsInfo={data.eventsInfo}
        formValues={formValues}
        step={step}
        onStepChange={setStep}
        onButtonsDisabledChange={setDisabledButtons}
      />
    </Modal>
  );
};
