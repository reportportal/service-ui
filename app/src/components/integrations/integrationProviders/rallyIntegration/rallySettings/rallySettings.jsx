/*
 * Copyright 2019 EPAM Systems
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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';
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

@connect(null, {
  showModalAction,
  hideModalAction,
})
@injectIntl
export class RallySettings extends Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    data: PropTypes.object.isRequired,
    goToPreviousPage: PropTypes.func.isRequired,
    onUpdate: PropTypes.func.isRequired,
    showModalAction: PropTypes.func.isRequired,
    hideModalAction: PropTypes.func.isRequired,
    isGlobal: PropTypes.bool,
  };

  static defaultProps = {
    isGlobal: false,
  };

  onSubmit = (data, callback, metaData) => {
    const { fields, checkedFieldsIds = {}, ...meta } = metaData;
    const defectFormFields = getDefectFormFields(fields, checkedFieldsIds, data);

    this.props.onUpdate({ defectFormFields }, callback, meta);
  };

  getEditAuthConfig = () => ({
    content: <BtsAuthFieldsInfo fieldsConfig={this.authFieldsConfig} />,
    onClick: this.editAuthorizationClickHandler,
  });

  authFieldsConfig = [
    {
      value: this.props.data.integrationParameters.url,
      message: this.props.intl.formatMessage(COMMON_BTS_MESSAGES.linkToBtsLabel),
    },
    {
      value: this.props.data.integrationParameters.project,
      message: this.props.intl.formatMessage(messages.projectIdLabel),
    },
  ];

  editAuthorizationClickHandler = () => {
    const {
      data: { name, integrationParameters, integrationType },
      onUpdate,
    } = this.props;

    this.props.showModalAction({
      id: 'addIntegrationModal',
      data: {
        onConfirm: (data, metaData) => onUpdate(data, this.props.hideModalAction, metaData),
        instanceType: integrationType.name,
        customProps: {
          initialData: {
            ...integrationParameters,
            integrationName: name,
          },
          editAuthMode: true,
        },
      },
    });
  };

  render() {
    const { data, goToPreviousPage, isGlobal } = this.props;

    return (
      <IntegrationSettings
        data={data}
        onUpdate={this.onSubmit}
        goToPreviousPage={goToPreviousPage}
        formFieldsComponent={BtsPropertiesForIssueForm}
        formKey={BTS_FIELDS_FORM}
        editAuthConfig={this.getEditAuthConfig()}
        isGlobal={isGlobal}
        isEmptyConfiguration={
          !data.integrationParameters.defectFormFields ||
          !data.integrationParameters.defectFormFields.length
        }
      />
    );
  }
}
