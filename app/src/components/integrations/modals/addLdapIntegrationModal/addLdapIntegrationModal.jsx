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

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect, useDispatch } from 'react-redux';
import { submit, reset, isDirty, isValid } from 'redux-form';
import { useTracking } from 'react-tracking';
import { defineMessages, useIntl } from 'react-intl';
import { Modal } from '@reportportal/ui-kit';
import { withModal } from 'components/main/modal';
import { hideModalAction } from 'controllers/modal';
import { FULL_NAME } from 'components/integrations/integrationProviders/ldapIntegration/constants';
import { INTEGRATION_FORM } from 'components/integrations/elements';
import { PLUGINS_PAGE_EVENTS } from 'components/main/analytics/events';
import { TwoStepsContent } from './twoSteps/twoStepsContent';
import { createTwoStepsFooter } from './twoSteps/twoStepsFooter';

const messages = defineMessages({
  createLdapTitle: {
    id: 'AddLdapIntegrationModal.createLdapTitle',
    defaultMessage: 'Create Global Integration',
  },
  editLdapIntegrationTitle: {
    id: 'AddLdapIntegrationModal.editLdapIntegrationTitle',
    defaultMessage: 'Edit Global Integration',
  },
  serverSettingsTitle: {
    id: 'AddLdapIntegrationModal.serverSettingsTitle',
    defaultMessage: 'Server settings',
  },
  fieldSettingsTitle: {
    id: 'AddLdapIntegrationModal.fieldSettingsTitle',
    defaultMessage: 'Field settings',
  },
});

const AddLdapIntegrationModal = ({ data, dirty, valid }) => {
  const [metaData, setMetaData] = useState({});
  const [stepNumber, setStepNumber] = useState(1);
  const [forceConfirm, setForceConfirm] = useState(false);
  const [closeModal, setCloseModal] = useState(false);
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();
  const { trackEvent } = useTracking();
  const { onConfirm, customProps } = data;

  const updateMetaData = (newMetaData) => {
    setMetaData({ ...metaData, ...newMetaData });
  };

  const isEdit = customProps.editAuthMode;

  const onSubmit = (newData) => {
    if (stepNumber === 1 && !forceConfirm) {
      setStepNumber(2);
    } else if (isEdit) {
      trackEvent(PLUGINS_PAGE_EVENTS.clickEditLdapIntegration(newData.nameType === FULL_NAME));
      onConfirm(newData, () => setCloseModal(true), metaData);
    } else {
      trackEvent(PLUGINS_PAGE_EVENTS.clickCreateLdapIntegration(newData.nameType === FULL_NAME));
      onConfirm(newData, metaData);
    }
  };

  const handleSubmit = () => dispatch(submit(INTEGRATION_FORM));

  const createTitle = messages.createLdapTitle;
  const editTitle = messages.editLdapIntegrationTitle;

  const stepTitles = [
    formatMessage(messages.serverSettingsTitle),
    formatMessage(messages.fieldSettingsTitle),
  ];

  const onStepChange = (step) => {
    if (step > stepNumber) {
      valid && setStepNumber(step);
      handleSubmit();
    } else {
      setStepNumber(step);
    }
  };

  const onDiscard = () => dispatch(reset(INTEGRATION_FORM));
  return (
    <Modal
      title={formatMessage(isEdit ? editTitle : createTitle)}
      onClose={() => dispatch(hideModalAction())}
      allowCloseOutside={!dirty}
      CustomFooter={createTwoStepsFooter(
        stepNumber,
        setStepNumber,
        onStepChange,
        onDiscard,
        isEdit,
        setForceConfirm,
        handleSubmit,
        forceConfirm,
        closeModal,
      )}
      size={'large'}
    >
      <TwoStepsContent
        steps={stepTitles.map((title, index) => ({
          index: index + 1,
          title,
          onClick: () => onStepChange(index + 1),
          active: stepNumber === index + 1,
        }))}
        onSubmit={onSubmit}
        data={data}
        updateMetaData={updateMetaData}
        stepNumber={stepNumber}
      />
    </Modal>
  );
};
AddLdapIntegrationModal.propTypes = {
  data: PropTypes.object,
  dirty: PropTypes.bool.isRequired,
  valid: PropTypes.bool.isRequired,
};

export default withModal('addLdapIntegrationModal')(
  connect((state) => ({
    dirty: isDirty(INTEGRATION_FORM)(state),
    valid: isValid(INTEGRATION_FORM)(state),
  }))(AddLdapIntegrationModal),
);
