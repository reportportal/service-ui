/*
 * Copyright 2024 EPAM Systems
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

import React, { useEffect } from 'react';
import { Button } from '@reportportal/ui-kit';
import classNames from 'classnames/bind';
import PropTypes from 'prop-types';
import { defineMessages, useIntl } from 'react-intl';
import Parser from 'html-react-parser';
import RightArrowIcon from 'common/img/arrow-right-inline.svg';
import styles from './twoStepsFooter.scss';

const cx = classNames.bind(styles);

const messages = defineMessages({
  nextStep: {
    id: 'TwoStepsFooter.nextStep',
    defaultMessage: 'Next step',
  },
  saveAndClose: {
    id: 'TwoStepsFooter.saveAndClose',
    defaultMessage: 'Save & close',
  },
  create: {
    id: 'TwoStepsFooter.create',
    defaultMessage: 'Create',
  },
  discardChanges: {
    id: 'TwoStepsFooter.discardChanges',
    defaultMessage: 'Discard changes',
  },
  cancel: {
    id: 'TwoStepsFooter.cancel',
    defaultMessage: 'Cancel',
  },
  previousStep: {
    id: 'TwoStepsFooter.previousStep',
    defaultMessage: 'Previous step',
  },
});

export const createTwoStepsFooter = (
  stepNumber,
  onStepNumberChange,
  onStepChange,
  onDiscard,
  isEdit,
  onForceConfirmChange,
  handleSubmit,
  forceConfirm,
  closeModal,
) => {
  return (closeHandler) => (
    <TwoStepsFooter
      stepNumber={stepNumber}
      onStepNumberChange={onStepNumberChange}
      onStepChange={onStepChange}
      onDiscard={onDiscard}
      isEdit={isEdit}
      onForceConfirmChange={onForceConfirmChange}
      handleSubmit={handleSubmit}
      forceConfirm={forceConfirm}
      closeModal={closeModal}
      closeHandler={closeHandler.closeHandler}
    />
  );
};

export const TwoStepsFooter = ({
  stepNumber,
  onStepNumberChange,
  onStepChange,
  onDiscard,
  isEdit,
  onForceConfirmChange,
  handleSubmit,
  forceConfirm,
  closeModal,
  closeHandler,
}) => {
  const { formatMessage } = useIntl();

  useEffect(() => {
    closeModal && closeHandler();
  }, [closeModal]);

  useEffect(() => {
    !closeModal && forceConfirm && handleSubmit();
  }, [forceConfirm]);

  const onNext = () => {
    onStepChange(stepNumber + 1);
  };

  const isFirstStep = stepNumber === 1;

  const getSubmitButtonText = () => {
    if (isFirstStep) {
      return formatMessage(messages.nextStep);
    } else if (isEdit) {
      return formatMessage(messages.saveAndClose);
    } else {
      return formatMessage(messages.create);
    }
  };

  const saveAndClose = () => {
    onForceConfirmChange(true);
  };

  return (
    <div className={cx('two-steps-footer')}>
      {isEdit ? (
        <>
          <Button
            className={cx('discard-button')}
            variant={'ghost'}
            onClick={onDiscard}
            data-automation-id="discardButton"
          >
            {formatMessage(messages.discardChanges)}
          </Button>
          {isFirstStep && (
            <Button
              variant={'ghost'}
              onClick={saveAndClose}
              data-automation-id="saveAndCloseButton"
            >
              {formatMessage(messages.saveAndClose)}
            </Button>
          )}
        </>
      ) : (
        <Button
          className={cx('cancel-button')}
          variant={'ghost'}
          onClick={closeHandler}
          data-automation-id="cancelButton"
        >
          {formatMessage(messages.cancel)}
        </Button>
      )}
      {stepNumber === 2 && (
        <Button variant={'ghost'} onClick={() => onStepNumberChange(1)}>
          <i className={cx('left-icon')}>{Parser(RightArrowIcon)}</i>
          {formatMessage(messages.previousStep)}
        </Button>
      )}
      <Button onClick={onNext} data-automation-id="submitButton">
        {getSubmitButtonText()}
        {isFirstStep && <i className={cx('right-icon')}>{Parser(RightArrowIcon)}</i>}
      </Button>
    </div>
  );
};
TwoStepsFooter.propTypes = {
  stepNumber: PropTypes.number.isRequired,
  onStepNumberChange: PropTypes.func.isRequired,
  onStepChange: PropTypes.func.isRequired,
  onDiscard: PropTypes.func,
  isEdit: PropTypes.bool,
  onForceConfirmChange: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  forceConfirm: PropTypes.bool,
  closeModal: PropTypes.bool,
  closeHandler: PropTypes.func.isRequired,
};
TwoStepsFooter.defaultProps = {
  isEdit: false,
  onDiscard: () => {},
  forceConfirm: false,
  closeModal: false,
};
