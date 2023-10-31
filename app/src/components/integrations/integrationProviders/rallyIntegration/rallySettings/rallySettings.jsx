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
import { useDispatch } from 'react-redux';
import { useIntl } from 'react-intl';
import { showModalAction, hideModalAction } from 'controllers/modal';
import {
  BtsAuthFieldsInfo,
  BtsPropertiesForIssueForm,
  BTS_FIELDS_FORM,
  COMMON_BTS_MESSAGES,
  getDefectFormFields,
} from 'components/integrations/elements/bts';
import { IntegrationSettings } from 'components/integrations/elements';
import { messages } from '../messages';

export const RallySettings = (props) => {
  const dispatch = useDispatch();
  const { formatMessage } = useIntl();

  const onSubmit = (data, callback, metaData) => {
    const { fields, checkedFieldsIds = {}, ...meta } = metaData;
    const defectFormFields = getDefectFormFields(fields, checkedFieldsIds, data);

    props.onUpdate({ defectFormFields }, callback, meta);
  };

  const authFieldsConfig = [
    {
      value: props.data.integrationParameters.url,
      message: formatMessage(COMMON_BTS_MESSAGES.linkToBtsLabel),
    },
    {
      value: props.data.integrationParameters.project,
      message: formatMessage(messages.projectIdLabel),
    },
  ];

  const getConfirmationFunc = (testConnection) => (data, metaData) => {
    const { onUpdate } = props;

    onUpdate(
      data,
      () => {
        dispatch(hideModalAction());
        testConnection();
      },
      metaData,
    );
  };

  const editAuthorizationClickHandler = (testConnection) => {
    const {
      data: { name, integrationParameters, integrationType },
      isGlobal,
    } = props;

    dispatch(
      showModalAction({
        id: 'addIntegrationModal',
        data: {
          isGlobal,
          onConfirm: getConfirmationFunc(testConnection),
          instanceType: integrationType.name,
          customProps: {
            initialData: {
              ...integrationParameters,
              integrationName: name,
            },
            editAuthMode: true,
          },
        },
      }),
    );
  };

  const getEditAuthConfig = () => ({
    content: <BtsAuthFieldsInfo fieldsConfig={authFieldsConfig} />,
    onClick: editAuthorizationClickHandler,
  });

  const { data, goToPreviousPage, isGlobal } = props;
  return (
    <IntegrationSettings
      data={data}
      onUpdate={onSubmit}
      goToPreviousPage={goToPreviousPage}
      formFieldsComponent={BtsPropertiesForIssueForm}
      formKey={BTS_FIELDS_FORM}
      editAuthConfig={getEditAuthConfig()}
      isGlobal={isGlobal}
      isEmptyConfiguration={
        !data.integrationParameters.defectFormFields ||
        !data.integrationParameters.defectFormFields.length
      }
    />
  );
};

RallySettings.propTypes = {
  data: PropTypes.object.isRequired,
  goToPreviousPage: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
  isGlobal: PropTypes.bool,
};

RallySettings.defaultProps = {
  isGlobal: false,
};
